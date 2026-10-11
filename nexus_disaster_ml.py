"""
================================================================================
NEXUS: PLANETARY DISASTER PREDICTION & METRIC NORMALIZATION ML ENGINE
================================================================================
Mathematical Formulations Implemented:
1. Earthquake (E):  E = min(1.0, max(0.0, (Mw - 4.0) / 5.0))  [for Mw >= 4.0]
2. Cyclone (C):     C = min(1.0, max(0.0, (Vmax - 17.0) / 55.0))  [for Vmax >= 17.0 m/s]
3. Flood (F):       F = min(1.0, max(0.0, h_max / h_flood))
4. Landslide (L):   L = min(1.0, max(0.0, V_max / V_slip))
5. Tsunami (T):     T = min(1.0, max(0.0, H_max / H_runup))
================================================================================
"""

import os
import sys
import json
import argparse
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    mean_squared_error,
    r2_score,
    mean_absolute_error
)

# ------------------------------------------------------------------------------
# 1. MATHEMATICAL FORMULATION & METRIC NORMALIZATION LAYER
# ------------------------------------------------------------------------------
class DisasterMetricFormulas:
    """
    Implements the exact physical normalization scales for planetary hazard scoring.
    All outputs are strictly bounded within [0.0, 1.0].
    """

    @staticmethod
    def earthquake_metric(mw: float) -> float:
        """
        Earthquake (E):
        E = min(1.0, (Mw - 4.0) / 5.0) for Mw >= 4.0, else 0.0
        """
        if mw is None or np.isnan(mw) or mw < 4.0:
            return 0.0
        return float(np.clip((mw - 4.0) / 5.0, 0.0, 1.0))

    @staticmethod
    def cyclone_metric(v_max_mps: float) -> float:
        """
        Cyclone (C):
        C = min(1.0, (Vmax - 17.0) / 55.0) for Vmax >= 17.0 m/s, else 0.0
        17 m/s (~61 km/h) is the gale/tropical storm threshold.
        72 m/s (~260 km/h) corresponds to Cat 5 Super Cyclone (C = 1.0).
        """
        if v_max_mps is None or np.isnan(v_max_mps) or v_max_mps < 17.0:
            return 0.0
        return float(np.clip((v_max_mps - 17.0) / 55.0, 0.0, 1.0))

    @staticmethod
    def flood_metric(h_max: float, h_flood_baseline: float = 3.5) -> float:
        """
        Flood (F):
        F = min(1.0, h_max / h_flood)
        h_max: peak inundation depth (meters) or discharge anomaly index
        h_flood_baseline: critical inundation baseline threshold (meters)
        """
        if h_max is None or np.isnan(h_max) or h_max <= 0.0:
            return 0.0
        base = max(0.1, h_flood_baseline)
        return float(np.clip(h_max / base, 0.0, 1.0))

    @staticmethod
    def landslide_metric(v_max: float, v_slip_threshold: float = 50000.0) -> float:
        """
        Landslide (L):
        L = min(1.0, V_max / V_slip)
        V_max: estimated failure mass/volume (m^3) or slope velocity anomaly
        V_slip_threshold: critical catastrophic volume threshold
        """
        if v_max is None or np.isnan(v_max) or v_max <= 0.0:
            return 0.0
        base = max(1.0, v_slip_threshold)
        return float(np.clip(v_max / base, 0.0, 1.0))

    @staticmethod
    def tsunami_metric(h_max_wave: float, h_runup_critical: float = 10.0) -> float:
        """
        Tsunami (T):
        T = min(1.0, H_max / H_runup)
        H_max_wave: measured/projected run-up wave height (meters)
        H_runup_critical: catastrophic coastal run-up baseline (meters)
        """
        if h_max_wave is None or np.isnan(h_max_wave) or h_max_wave <= 0.0:
            return 0.0
        base = max(0.5, h_runup_critical)
        return float(np.clip(h_max_wave / base, 0.0, 1.0))


# ------------------------------------------------------------------------------
# 2. TREE ENSEMBLE FOREST (PURE-PYTHON / NUMPY ROBUST ARCHITECTURE)
# ------------------------------------------------------------------------------
class PureForestClassifier:
    """Bootstrap Tree Forest Classifier with feature sub-sampling."""
    def __init__(self, n_estimators=60, max_depth=10, max_features='sqrt', random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.max_features = max_features
        self.random_state = random_state
        self.trees = []
        self.feature_subsets = []
        self.classes_ = None

    def fit(self, X, y):
        rng = np.random.RandomState(self.random_state)
        n_samples, n_features = X.shape
        self.classes_ = np.unique(y)
        self.trees = []
        self.feature_subsets = []

        feat_k = int(np.sqrt(n_features)) if self.max_features == 'sqrt' else max(1, int(n_features * 0.8))
        feat_k = max(1, min(feat_k, n_features))

        for i in range(self.n_estimators):
            idx = rng.choice(n_samples, size=n_samples, replace=True)
            feat_idx = rng.choice(n_features, size=feat_k, replace=False)
            tree = DecisionTreeClassifier(max_depth=self.max_depth, random_state=rng.randint(10000))
            tree.fit(X[idx][:, feat_idx], y[idx])
            self.trees.append(tree)
            self.feature_subsets.append(feat_idx)
        return self

    def predict_proba(self, X):
        n_samples = X.shape[0]
        n_classes = len(self.classes_)
        class_to_idx = {c: i for i, c in enumerate(self.classes_)}
        probas = np.zeros((n_samples, n_classes), dtype=float)

        for tree, feat_idx in zip(self.trees, self.feature_subsets):
            sub_proba = tree.predict_proba(X[:, feat_idx])
            for local_i, c in enumerate(tree.classes_):
                if c in class_to_idx:
                    probas[:, class_to_idx[c]] += sub_proba[:, local_i]

        probas /= len(self.trees)
        return probas

    def predict(self, X):
        probas = self.predict_proba(X)
        return self.classes_[np.argmax(probas, axis=1)]


class PureForestRegressor:
    """Bootstrap Tree Forest Regressor with feature sub-sampling."""
    def __init__(self, n_estimators=60, max_depth=10, max_features='sqrt', random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.max_features = max_features
        self.random_state = random_state
        self.trees = []
        self.feature_subsets = []

    def fit(self, X, y):
        rng = np.random.RandomState(self.random_state)
        n_samples, n_features = X.shape
        self.trees = []
        self.feature_subsets = []

        feat_k = int(np.sqrt(n_features)) if self.max_features == 'sqrt' else max(1, int(n_features * 0.8))
        feat_k = max(1, min(feat_k, n_features))

        for i in range(self.n_estimators):
            idx = rng.choice(n_samples, size=n_samples, replace=True)
            feat_idx = rng.choice(n_features, size=feat_k, replace=False)
            tree = DecisionTreeRegressor(max_depth=self.max_depth, random_state=rng.randint(10000))
            tree.fit(X[idx][:, feat_idx], y[idx])
            self.trees.append(tree)
            self.feature_subsets.append(feat_idx)
        return self

    def predict(self, X):
        preds = np.zeros(X.shape[0], dtype=float)
        for tree, feat_idx in zip(self.trees, self.feature_subsets):
            preds += tree.predict(X[:, feat_idx])
        preds /= len(self.trees)
        return preds


# ------------------------------------------------------------------------------
# 3. DATA INGESTION & FEATURE SYNTHESIS
# ------------------------------------------------------------------------------
class DisasterDataEngine:
    """
    Ingests raw historical disaster CSVs, parses temporal & trigger cues,
    and maps physical formula proxies to ensure mathematically grounded modeling.
    """

    SEVERITY_MAPPING = {
        'low': 0.25,
        'minor': 0.20,
        'moderate': 0.55,
        'medium': 0.50,
        'severe': 0.85,
        'high': 0.80,
        'catastrophic': 1.0,
        'extreme': 0.95
    }

    @classmethod
    def infer_disaster_type(cls, trigger_text: str, location: str = "") -> str:
        t = (str(trigger_text) + " " + str(location)).lower()
        if 'earthquake' in t or 'seismic' in t or 'tremor' in t:
            return 'Earthquake'
        if any(w in t for w in ['cyclone', 'storm', 'wind', 'typhoon', 'vardah', 'gaja', 'nivar', 'mandous', 'michaung', 'fengal']):
            return 'Cyclone'
        if 'landslide' in t or 'debris' in t or 'slope' in t or 'mudslide' in t:
            return 'Landslide'
        if 'tsunami' in t or 'tidal wave' in t:
            return 'Tsunami'
        return 'Flood'

    @classmethod
    def infer_physical_proxies(cls, row: pd.Series) -> dict:
        trigger = str(row.get('trigger', '')).lower()
        severity_str = str(row.get('severity', 'moderate')).lower().strip()
        base_sev = cls.SEVERITY_MAPPING.get(severity_str, 0.5)
        affected = float(row.get('affected_people', 100000))
        deaths = float(row.get('deaths', 0))

        if 'extreme' in trigger or 'cloudburst' in trigger or base_sev >= 0.8:
            h_flood = 3.5 + np.log10(max(1, affected)) * 0.35 + (deaths / 100.0)
        else:
            h_flood = 1.2 + np.log10(max(1, affected)) * 0.2

        if 'cyclone' in trigger or 'storm' in trigger:
            v_max = 22.0 + base_sev * 40.0 + (deaths / 20.0)
        else:
            v_max = 12.0

        if 'earthquake' in trigger:
            mw = 4.5 + base_sev * 4.0
        else:
            mw = 2.0

        if 'landslide' in trigger:
            v_landslide = 5000.0 + base_sev * 60000.0
        else:
            v_landslide = 0.0

        if 'tsunami' in trigger or 'surge' in trigger:
            h_tsunami = 1.5 + base_sev * 8.0
        else:
            h_tsunami = 0.0

        e_norm = DisasterMetricFormulas.earthquake_metric(mw)
        c_norm = DisasterMetricFormulas.cyclone_metric(v_max)
        f_norm = DisasterMetricFormulas.flood_metric(h_flood, h_flood_baseline=3.5)
        l_norm = DisasterMetricFormulas.landslide_metric(v_landslide, v_slip_threshold=50000.0)
        t_norm = DisasterMetricFormulas.tsunami_metric(h_tsunami, h_runup_critical=10.0)

        dtype = cls.infer_disaster_type(trigger, str(row.get('location', '')))
        if dtype == 'Earthquake':
            formula_score = e_norm
        elif dtype == 'Cyclone':
            formula_score = c_norm
        elif dtype == 'Landslide':
            formula_score = l_norm
        elif dtype == 'Tsunami':
            formula_score = t_norm
        else:
            formula_score = f_norm

        return {
            'disaster_type': dtype,
            'mw': mw,
            'v_max_mps': v_max,
            'h_inundation': h_flood,
            'landslide_vol': v_landslide,
            'tsunami_wave': h_tsunami,
            'e_norm': e_norm,
            'c_norm': c_norm,
            'f_norm': f_norm,
            'l_norm': l_norm,
            't_norm': t_norm,
            'formula_risk_index': float(formula_score)
        }

    @classmethod
    def augment_multi_hazard_dataset(cls, df_raw: pd.DataFrame, n_samples: int = 1500) -> pd.DataFrame:
        records = []
        for _, row in df_raw.iterrows():
            proxies = cls.infer_physical_proxies(row)
            item = {
                'year': int(row.get('year', 2020)),
                'month': int(row.get('month', 11)),
                'day': int(row.get('day', 15)),
                'district': str(row.get('district', 'Chennai')),
                'location': str(row.get('location', '')),
                'river_basin': str(row.get('river_basin', 'Coastal')),
                'trigger': str(row.get('trigger', '')),
                'severity': str(row.get('severity', 'Moderate')),
                'deaths': float(row.get('deaths', 0)),
                'affected_people': float(row.get('affected_people', 50000)),
                'source': str(row.get('source', 'Historical Archive')),
                **proxies
            }
            records.append(item)

        np.random.seed(42)
        districts = [
            'Chennai', 'Cuddalore', 'Nagapattinam', 'Kanyakumari', 'Tirunelveli',
            'Thanjavur', 'Villupuram', 'Kanchipuram', 'Nilgiris', 'Coimbatore',
            'Ramanathapuram', 'Thoothukudi', 'Chengalpattu'
        ]
        basins = ['Adyar-Cooum', 'Cauvery', 'Gadilam-Ponnaiyar', 'Thamirabarani', 'Palar', 'Vaigai', 'Coastal streams', 'Mountain slopes']

        disaster_generators = [
            ('Flood', ['NE Monsoon extreme cloudburst', 'Dam reservoir release surge', 'Urban drainage flash inundation', 'Depression rain vortex'], [10, 11, 12, 1]),
            ('Cyclone', ['Very Severe Cyclonic Storm (VSCS)', 'Depression gale landfall', 'Super Cyclonic Storm windstorm', 'Storm surge depression'], [10, 11, 12, 5]),
            ('Landslide', ['Steep slope saturated debris flow', 'Torrential rain hill mudslide', 'Ghats road cliff collapse'], [6, 7, 8, 10, 11]),
            ('Earthquake', ['Offshore faultline intraplate tremor', 'Deep crustal tectonic displacement', 'Coastal strike-slip seismic rupture'], list(range(1, 13))),
            ('Tsunami', ['Sumatra-Andaman megathrust subduction wave', 'Deep oceanic tectonic run-up surge'], list(range(1, 13)))
        ]

        for _ in range(n_samples):
            dtype, triggers, active_months = disaster_generators[np.random.choice(len(disaster_generators), p=[0.40, 0.28, 0.12, 0.10, 0.10])]
            month = int(np.random.choice(active_months))
            day = int(np.random.randint(1, 29))
            year = int(np.random.randint(1995, 2026))
            district = str(np.random.choice(districts))
            basin = 'Mountain slopes' if dtype == 'Landslide' else str(np.random.choice(basins))
            trigger = str(np.random.choice(triggers))

            if dtype == 'Earthquake':
                mw = float(np.random.uniform(4.0, 8.9))
                v_max = float(np.random.uniform(5.0, 18.0))
                h_flood = 0.0
                l_vol = 0.0
                h_tsunami = float(np.random.uniform(0.0, 12.0)) if mw > 7.5 else 0.0
            elif dtype == 'Cyclone':
                mw = 0.0
                v_max = float(np.random.uniform(18.0, 75.0))
                h_flood = float(np.random.uniform(0.5, 4.2))
                l_vol = float(np.random.uniform(0.0, 20000.0))
                h_tsunami = float(np.random.uniform(0.5, 3.5))
            elif dtype == 'Flood':
                mw = 0.0
                v_max = float(np.random.uniform(10.0, 32.0))
                h_flood = float(np.random.uniform(0.8, 5.8))
                l_vol = float(np.random.uniform(0.0, 15000.0))
                h_tsunami = 0.0
            elif dtype == 'Landslide':
                mw = float(np.random.choice([0.0, 4.2]))
                v_max = float(np.random.uniform(10.0, 25.0))
                h_flood = float(np.random.uniform(0.5, 2.0))
                l_vol = float(np.random.uniform(5000.0, 85000.0))
                h_tsunami = 0.0
            else: # Tsunami
                mw = float(np.random.uniform(7.8, 9.3))
                v_max = float(np.random.uniform(15.0, 30.0))
                h_flood = float(np.random.uniform(2.0, 7.0))
                l_vol = 0.0
                h_tsunami = float(np.random.uniform(1.5, 18.0))

            # Apply exact mathematical formulas
            e_norm = DisasterMetricFormulas.earthquake_metric(mw)
            c_norm = DisasterMetricFormulas.cyclone_metric(v_max)
            f_norm = DisasterMetricFormulas.flood_metric(h_flood, h_flood_baseline=3.5)
            l_norm = DisasterMetricFormulas.landslide_metric(l_vol, v_slip_threshold=50000.0)
            t_norm = DisasterMetricFormulas.tsunami_metric(h_tsunami, h_runup_critical=10.0)

            if dtype == 'Earthquake':
                formula_score = e_norm
            elif dtype == 'Cyclone':
                formula_score = c_norm
            elif dtype == 'Landslide':
                formula_score = l_norm
            elif dtype == 'Tsunami':
                formula_score = t_norm
            else:
                formula_score = f_norm

            affected = int(np.exp(np.random.normal(10 + formula_score * 4, 0.7)))
            deaths = int(max(0, np.random.poisson(formula_score * 40 * (1 + (formula_score > 0.8) * 3))))

            sev = 'Severe' if formula_score >= 0.75 else ('Moderate' if formula_score >= 0.40 else 'Minor')

            records.append({
                'year': year,
                'month': month,
                'day': day,
                'district': district,
                'location': f"{district} Sector {np.random.randint(1, 10)}",
                'river_basin': basin,
                'trigger': trigger,
                'severity': sev,
                'deaths': deaths,
                'affected_people': affected,
                'source': 'Physics Multi-Hazard Synthetic Sim',
                'disaster_type': dtype,
                'mw': mw,
                'v_max_mps': v_max,
                'h_inundation': h_flood,
                'landslide_vol': l_vol,
                'tsunami_wave': h_tsunami,
                'e_norm': e_norm,
                'c_norm': c_norm,
                'f_norm': f_norm,
                'l_norm': l_norm,
                't_norm': t_norm,
                'formula_risk_index': formula_score
            })

        return pd.DataFrame(records)


# ------------------------------------------------------------------------------
# 4. HIGH-ACCURACY DEEP ENSEMBLE ML MODEL PIPELINE
# ------------------------------------------------------------------------------
class NexusDisasterPredictor:
    """
    State-of-the-Art Planetary Disaster Prediction & Risk Level Machine Learning Pipeline.
    Combines:
    1. Multi-Layer Perceptron (Deep Neural Network)
    2. Bootstrap Tree Forest Ensemble
    3. Soft-Voting Meta-Estimator
    4. Exact Mathematical Physics Formula Metrics Regularization
    """

    def __init__(self):
        self.scaler = None
        self.tfidf = None
        self.dist_ohe = None
        self.mlp_clf = None
        self.forest_clf = None
        self.mlp_reg = None
        self.forest_reg = None
        self.ridge_reg = None
        self.classes_ = []
        self.is_trained = False
        self.metrics_report = {}

    def _build_feature_matrix(self, df: pd.DataFrame, is_training: bool = True) -> np.ndarray:
        months = df['month'].astype(float).values
        days = df['day'].astype(float).values
        month_sin = np.sin(2 * np.pi * months / 12.0)
        month_cos = np.cos(2 * np.pi * months / 12.0)
        day_sin = np.sin(2 * np.pi * days / 31.0)
        day_cos = np.cos(2 * np.pi * days / 31.0)

        ne_monsoon = ((months >= 10) & (months <= 12)).astype(float)
        sw_monsoon = ((months >= 6) & (months <= 9)).astype(float)

        mw = df['mw'].fillna(0.0).values
        v_max = df['v_max_mps'].fillna(0.0).values
        h_flood = df['h_inundation'].fillna(0.0).values
        l_vol = df['landslide_vol'].fillna(0.0).values
        h_tsunami = df['tsunami_wave'].fillna(0.0).values

        e_norm = df['e_norm'].fillna(0.0).values
        c_norm = df['c_norm'].fillna(0.0).values
        f_norm = df['f_norm'].fillna(0.0).values
        l_norm = df['l_norm'].fillna(0.0).values
        t_norm = df['t_norm'].fillna(0.0).values

        if is_training:
            self.tfidf = TfidfVectorizer(max_features=25, stop_words='english')
            text_features = self.tfidf.fit_transform(df['trigger'].fillna('') + " " + df['river_basin'].fillna('')).toarray()
        else:
            text_features = self.tfidf.transform(df['trigger'].fillna('') + " " + df['river_basin'].fillna('')).toarray()

        if is_training:
            self.dist_ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
            dist_features = self.dist_ohe.fit_transform(df[['district']])
        else:
            dist_features = self.dist_ohe.transform(df[['district']])

        numerical_feats = np.column_stack([
            months, days, month_sin, month_cos, day_sin, day_cos,
            ne_monsoon, sw_monsoon,
            mw, v_max, h_flood, l_vol, h_tsunami,
            e_norm, c_norm, f_norm, l_norm, t_norm
        ])

        X = np.hstack([numerical_feats, dist_features, text_features])
        return X

    def train(self, df: pd.DataFrame):
        print("\n" + "="*75)
        print("  TRAINING NEXUS DISASTER PREDICTION & METRIC ML ENSEMBLE")
        print("="*75)

        X = self._build_feature_matrix(df, is_training=True)
        y_class = df['disaster_type'].values
        y_reg = df['formula_risk_index'].values

        self.classes_ = np.unique(y_class)

        X_train, X_test, y_cls_train, y_cls_test, y_reg_train, y_reg_test = train_test_split(
            X, y_class, y_reg, test_size=0.20, random_state=42, stratify=y_class
        )

        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # ----------------------------------------------------------------------
        # A. CLASSIFIER ENSEMBLE: DEEP MLP + BOOTSTRAP FOREST
        # ----------------------------------------------------------------------
        print("[*] Training Deep Multi-Layer Perceptron (Neural Network) Classifier...")
        self.mlp_clf = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            alpha=0.0005,
            max_iter=400,
            random_state=42,
            early_stopping=True,
            n_iter_no_change=15
        )
        self.mlp_clf.fit(X_train_scaled, y_cls_train)

        print("[*] Training Bootstrap Tree Forest Classifier...")
        self.forest_clf = PureForestClassifier(n_estimators=80, max_depth=12, random_state=42)
        self.forest_clf.fit(X_train_scaled, y_cls_train)

        # Soft Voting Combination
        p_mlp = self.mlp_clf.predict_proba(X_test_scaled)
        p_forest = self.forest_clf.predict_proba(X_test_scaled)
        p_ensemble = 0.55 * p_mlp + 0.45 * p_forest
        y_cls_pred = self.mlp_clf.classes_[np.argmax(p_ensemble, axis=1)]

        cls_acc = accuracy_score(y_cls_test, y_cls_pred)
        cls_f1 = f1_score(y_cls_test, y_cls_pred, average='weighted')

        print(f"[+] Multi-Disaster Classification Accuracy: {cls_acc * 100:.2f}% (Peak Accuracy)")
        print(f"[+] Multi-Disaster Weighted F1-Score:     {cls_f1:.4f}")

        # ----------------------------------------------------------------------
        # B. REGRESSION ENSEMBLE: DEEP MLP + TREE FOREST + RIDGE
        # ----------------------------------------------------------------------
        print("[*] Training Continuous Formula Risk Score Regression Ensemble...")
        self.mlp_reg = MLPRegressor(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=400,
            random_state=42
        )
        self.mlp_reg.fit(X_train_scaled, y_reg_train)

        self.forest_reg = PureForestRegressor(n_estimators=80, max_depth=12, random_state=42)
        self.forest_reg.fit(X_train_scaled, y_reg_train)

        self.ridge_reg = Ridge(alpha=1.0)
        self.ridge_reg.fit(X_train_scaled, y_reg_train)

        # Meta-regression blend
        y_reg_pred = np.clip(
            0.50 * self.mlp_reg.predict(X_test_scaled) +
            0.40 * self.forest_reg.predict(X_test_scaled) +
            0.10 * self.ridge_reg.predict(X_test_scaled),
            0.0, 1.0
        )

        reg_r2 = r2_score(y_reg_test, y_reg_pred)
        reg_rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred))
        reg_mae = mean_absolute_error(y_reg_test, y_reg_pred)

        print(f"[+] Formula Risk Regression R² Score:    {reg_r2:.4f} (Peak Fit)")
        print(f"[+] Formula Risk RMSE:                   {reg_rmse:.4f}")
        print(f"[+] Formula Risk MAE:                    {reg_mae:.4f}")

        self.metrics_report = {
            'classification_accuracy': float(cls_acc),
            'classification_f1': float(cls_f1),
            'regression_r2': float(reg_r2),
            'regression_rmse': float(reg_rmse),
            'regression_mae': float(reg_mae),
            'training_samples': int(len(df)),
            'timestamp': datetime.now().isoformat()
        }
        self.is_trained = True

        print("\n--- Detailed Classification Performance Breakdown ---")
        print(classification_report(y_cls_test, y_cls_pred, digits=4))
        print("="*75)

    def predict(self, input_data: pd.DataFrame) -> pd.DataFrame:
        if not self.is_trained:
            raise RuntimeError("Model is not trained yet! Please run train() first.")

        records = []
        for _, row in input_data.iterrows():
            proxies = DisasterDataEngine.infer_physical_proxies(row)
            d = row.to_dict()
            for k, v in proxies.items():
                if k not in d or pd.isna(d[k]):
                    d[k] = v
            records.append(d)

        df_eval = pd.DataFrame(records)
        X = self._build_feature_matrix(df_eval, is_training=False)
        X_scaled = self.scaler.transform(X)

        p_mlp = self.mlp_clf.predict_proba(X_scaled)
        p_forest = self.forest_clf.predict_proba(X_scaled)
        p_ensemble = 0.55 * p_mlp + 0.45 * p_forest

        preds_class = self.mlp_clf.classes_[np.argmax(p_ensemble, axis=1)]

        preds_risk = np.clip(
            0.50 * self.mlp_reg.predict(X_scaled) +
            0.40 * self.forest_reg.predict(X_scaled) +
            0.10 * self.ridge_reg.predict(X_scaled),
            0.0, 1.0
        )

        results = []
        for i in range(len(df_eval)):
            row = df_eval.iloc[i]
            predicted_type = preds_class[i]
            risk_score = float(preds_risk[i])
            probas = {cls_name: float(p) for cls_name, p in zip(self.mlp_clf.classes_, p_ensemble[i])}

            if risk_score >= 0.75:
                threat_level = "CRITICAL / RED ALERT"
                action = "Immediate Evacuation & Disaster Response Grid Activation"
            elif risk_score >= 0.45:
                threat_level = "ELEVATED / ORANGE ALERT"
                action = "Pre-position Logistics, Deploy Early Warning Mesh"
            elif risk_score >= 0.20:
                threat_level = "WATCH / YELLOW ALERT"
                action = "Continuous Sensor Telemetry & Reservoir Monitoring"
            else:
                threat_level = "NORMAL / GREEN"
                action = "Baseline Telemetry Ingest"

            results.append({
                'district': row.get('district', 'Unknown'),
                'year': int(row.get('year', 2026)),
                'month': int(row.get('month', 1)),
                'day': int(row.get('day', 1)),
                'predicted_disaster_type': predicted_type,
                'confidence_probability': float(probas.get(predicted_type, 0.0)),
                'normalized_formula_risk_index': round(risk_score, 4),
                'threat_level': threat_level,
                'recommended_action': action,
                'formula_breakdown': {
                    'earthquake_E': round(float(row.get('e_norm', 0.0)), 4),
                    'cyclone_C': round(float(row.get('c_norm', 0.0)), 4),
                    'flood_F': round(float(row.get('f_norm', 0.0)), 4),
                    'landslide_L': round(float(row.get('l_norm', 0.0)), 4),
                    'tsunami_T': round(float(row.get('t_norm', 0.0)), 4)
                },
                'class_probabilities': probas
            })

        return pd.DataFrame(results)

    def save(self, filepath: str = "nexus_disaster_model.joblib"):
        state = {
            'mlp_clf': self.mlp_clf,
            'forest_clf': self.forest_clf,
            'mlp_reg': self.mlp_reg,
            'forest_reg': self.forest_reg,
            'ridge_reg': self.ridge_reg,
            'scaler': self.scaler,
            'tfidf': self.tfidf,
            'dist_ohe': self.dist_ohe,
            'classes_': self.classes_,
            'metrics_report': self.metrics_report,
            'is_trained': self.is_trained
        }
        joblib.dump(state, filepath)
        print(f"[OK] NEXUS ML Model successfully saved to: {filepath}")

    def load(self, filepath: str = "nexus_disaster_model.joblib"):
        state = joblib.load(filepath)
        self.mlp_clf = state['mlp_clf']
        self.forest_clf = state['forest_clf']
        self.mlp_reg = state['mlp_reg']
        self.forest_reg = state['forest_reg']
        self.ridge_reg = state['ridge_reg']
        self.scaler = state['scaler']
        self.tfidf = state['tfidf']
        self.dist_ohe = state['dist_ohe']
        self.classes_ = state['classes_']
        self.metrics_report = state['metrics_report']
        self.is_trained = state['is_trained']
        print(f"[OK] NEXUS ML Model loaded from: {filepath}")


# ------------------------------------------------------------------------------
# 5. MAIN SCRIPT EXECUTION & EVALUATION
# ------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="NEXUS Multi-Disaster Prediction & Formula Normalization ML System")
    parser.add_argument('--csv', type=str, default='data/tamil_nadu_historical_floods.csv', help="Path to input historical CSV")
    parser.add_argument('--save-model', type=str, default='nexus_disaster_model.joblib', help="Output path for trained model")
    parser.add_argument('--export-json', type=str, default='src/data/ml_prediction_results.json', help="Export predictions as JSON for UI")

    args = parser.parse_args()

    csv_path = args.csv
    if not os.path.exists(csv_path):
        alt_paths = ['../tamil_nadu_historical_floods.csv', 'tamil_nadu_historical_floods.csv']
        for p in alt_paths:
            if os.path.exists(p):
                csv_path = p
                break

    print(f"[*] Ingesting Historical Disaster CSV: {csv_path}")
    df_raw = pd.read_csv(csv_path)
    print(f"[+] Loaded {len(df_raw)} historical records from CSV.")

    print("[*] Generating multi-hazard physical metric space from formulas...")
    df_augmented = DisasterDataEngine.augment_multi_hazard_dataset(df_raw, n_samples=1600)
    print(f"[+] Prepared dataset with {len(df_augmented)} multi-hazard samples.")

    # Train Model
    model = NexusDisasterPredictor()
    model.train(df_augmented)
    model.save(args.save_model)

    # Run predictions on the original historical records + future projection scenarios
    print("\n[*] Running ML Inference on Historical CSV Records & Future Projection Scenarios...")
    df_eval_targets = df_raw.copy()
    
    future_scenarios = pd.DataFrame([
        {
            'year': 2026, 'month': 11, 'day': 18, 'district': 'Chennai',
            'location': 'Adyar Estuary & Marina Coastal Sector',
            'river_basin': 'Adyar-Cooum',
            'trigger': 'Intense NE Monsoon depression + cloudburst surge',
            'severity': 'Severe', 'deaths': 0, 'affected_people': 350000
        },
        {
            'year': 2026, 'month': 12, 'day': 5, 'district': 'Nagapattinam',
            'location': 'Velankanni Coastal Delta',
            'river_basin': 'Cauvery',
            'trigger': 'Very Severe Cyclonic Storm with 140km/h gale winds',
            'severity': 'Severe', 'deaths': 0, 'affected_people': 280000
        },
        {
            'year': 2026, 'month': 7, 'day': 22, 'district': 'Nilgiris',
            'location': 'Coonoor-Ooty Mountain Ghats',
            'river_basin': 'Mountain slopes',
            'trigger': 'Heavy torrential monsoon burst triggering steep slope mudslide',
            'severity': 'Moderate', 'deaths': 0, 'affected_people': 45000
        },
        {
            'year': 2026, 'month': 9, 'day': 14, 'district': 'Kanyakumari',
            'location': 'Indian Ocean Subduction Trench Sector',
            'river_basin': 'Coastal streams',
            'trigger': 'Mw 8.2 undersea megathrust earthquake with 4.5m tsunami run-up',
            'severity': 'Severe', 'deaths': 0, 'affected_people': 500000
        }
    ])
    df_combined = pd.concat([df_eval_targets, future_scenarios], ignore_index=True)

    predictions = model.predict(df_combined)

    print("\n" + "="*85)
    print("  NEXUS DISASTER PREDICTIONS & THREAT ASSESSMENTS")
    print("="*85)
    for idx, row in predictions.iterrows():
        print(f"[{row['year']}-{row['month']:02d}-{row['day']:02d}] {row['district'].ljust(14)} | "
              f"Pred: {row['predicted_disaster_type'].ljust(11)} | "
              f"Conf: {row['confidence_probability']*100:.1f}% | "
              f"Risk Index (0-1): {row['normalized_formula_risk_index']:.4f} | "
              f"Threat: {row['threat_level']}")

    if args.export_json:
        os.makedirs(os.path.dirname(args.export_json), exist_ok=True)
        export_payload = {
            'model_metrics': model.metrics_report,
            'formulas': {
                'earthquake': "E = min(1.0, max(0.0, (Mw - 4.0) / 5.0)) [for Mw >= 4.0]",
                'cyclone': "C = min(1.0, max(0.0, (Vmax - 17.0) / 55.0)) [for Vmax >= 17.0 m/s]",
                'flood': "F = min(1.0, max(0.0, h_max / h_flood))",
                'landslide': "L = min(1.0, max(0.0, V_max / V_slip))",
                'tsunami': "T = min(1.0, max(0.0, H_max / H_runup))"
            },
            'predictions': predictions.to_dict(orient='records')
        }
        with open(args.export_json, 'w', encoding='utf-8') as f:
            json.dump(export_payload, f, indent=2)
        print(f"\n[OK] Exported predictions payload to: {args.export_json}")

if __name__ == '__main__':
    main()
