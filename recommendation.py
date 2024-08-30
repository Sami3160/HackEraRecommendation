import pandas as pd
import joblib
import sys

# load the moadl 
model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')

#read path from cmd  line args
temp_file_path = sys.argv[1]

#preapre the data
data = pd.read_csv(temp_file_path)
data = data.dropna()  #remove missing values
# print(data.head())
#add weights for better recommendation
weights = {
    'likes': 0.5,
    'time_spent': 0.3,
    'num_visits': 0.2
}

data['weighted_likes'] = data['liked'] * weights['likes']
data['weighted_time_spent'] = data['view_time'] * weights['time_spent']
data['weighted_num_visits'] = data['visit_count'] * weights['num_visits']

data['interest_score'] = data['weighted_likes'] + data['weighted_time_spent'] + data['weighted_num_visits']

#here we predict the actual intrest score
features = ['weighted_likes', 'weighted_time_spent', 'weighted_num_visits']
X_user = data[features]
X_user_scaled = scaler.transform(X_user)

data['predicted_interest_score'] = model.predict(X_user_scaled)

#sorting the data based on the score
top_products = data.sort_values(by='predicted_interest_score', ascending=False).head(10)[['product_id', 'product_name', 'predicted_interest_score']]



#logging output for debugging
print(top_products.to_json(orient='records'))