import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib

# loading data
data = pd.read_csv('user_product_data.csv')
data = data.dropna()  # remove missing values


#adding weights for better results
# means more the waight more the importance of that feature
weights = {
    'likes': 0.5,
    'time_spent': 0.3,
    'num_visits': 0.2
}

data['weighted_likes'] = data['liked'] * weights['likes']
data['weighted_time_spent'] = data['view_time'] * weights['time_spent']
data['weighted_num_visits'] = data['visit_count'] * weights['num_visits']

data['interest_score'] = data['weighted_likes'] + data['weighted_time_spent'] + data['weighted_num_visits']

# modal training
features = ['weighted_likes', 'weighted_time_spent', 'weighted_num_visits']
X = data[features]
y = data['interest_score']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestRegressor()
model.fit(X_scaled, y)

# storeing the model and scaler

joblib.dump(model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')