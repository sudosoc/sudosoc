import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score, roc_curve
import seaborn as sns
import matplotlib.pyplot as plt

# 1. Load dataset
file_path = "EdgeIIoTset.csv"  # <-- change this path to your downloaded file
df = pd.read_csv(file_path)
print("Data loaded successfully")
print(df.head())

# 2. Data cleaning
# Drop irrelevant columns if exist
cols_to_drop = ['id', 'timestamp']  # adjust as needed
df = df.drop(columns=[c for c in cols_to_drop if c in df.columns], errors='ignore')

# Handle missing values: fill numeric NaNs with mean
numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

# 3. Convert multi-class labels to binary
label_col = 'label'  # adjust this if the label column name is different
df[label_col] = df[label_col].apply(lambda x: 0 if str(x).lower() == 'normal' else 1)

# 4. Encode categorical features
cat_cols = df.select_dtypes(include=['object']).columns
for col in cat_cols:
    if col != label_col:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])

# 5. Split X and y
X = df.drop(columns=[label_col])
y = df[label_col]

# 6. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 7. Feature scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# 8. Build model
model = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 9. Predictions and evaluation
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 10. Confusion Matrix
plt.figure(figsize=(5,4))
sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Blues')
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# 11. ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_prob)
plt.figure(figsize=(6,5))
plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {roc_auc_score(y_test, y_prob):.2f})")
plt.plot([0,1],[0,1],'k--')
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.show()