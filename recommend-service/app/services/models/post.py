import numpy as np
import pandas as pd
import networkx as nx
from faker import Faker
import random
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from tensorflow.keras.layers import Input, Embedding, Flatten, Concatenate, Dense, Dropout
from tensorflow.keras.models import Model

fake = Faker()

# ================= 1️⃣ TẠO DỮ LIỆU MÔ PHỎNG =================
posts = [{"post_id": i, "content": fake.text()} for i in range(1, 101)]
posts_df = pd.DataFrame(posts)

users = []
for i in range(1, 101):
    friends = random.sample(range(1, 101), random.randint(1, 20))
    users.append({"user_id": i, "friends": friends})

G = nx.Graph()
for user in users:
    G.add_node(user['user_id'])
    for friend in user['friends']:
        G.add_edge(user['user_id'], friend)

interactions = [{
    "user_id": random.randint(1, 100),
    "post_id": random.randint(1, 100),
    "like": random.randint(0, 1),
    "comment": random.randint(0, 1),
    "share": random.randint(0, 1),
    "dislike": random.randint(0, 1),
    "watch_time": random.randint(0, 60),
    "timestamp": fake.unix_time()
} for i in range(10000)]

weights = {'like': 1, 'comment': 5, 'share': 10, 'dislike': -2, 'watch_time': 0.1}

data = pd.DataFrame(interactions)

# ================= 2️⃣ Content-Based Filtering (CBF) =================
model_sbert = SentenceTransformer('all-MiniLM-L6-v2')
post_embeddings = model_sbert.encode(posts_df["content"].tolist(), normalize_embeddings=True)
similarity_matrix = cosine_similarity(post_embeddings)

def calculate_cbf_score(user_id, post_id):
    if post_id not in post_map:
        return 0  # Tránh lỗi KeyError nếu post_id không có trong post_map

    user_interactions = data[data["user_id"] == user_map[user_id]]
    viewed_posts = user_interactions["post_id"].unique()

    if len(viewed_posts) == 0:
        return 0

    valid_posts = [p for p in viewed_posts if p in post_map]
    if not valid_posts:
        return 0

    similarity_scores = similarity_matrix[post_map[post_id], [post_map[p] for p in valid_posts]]
    return np.mean(similarity_scores)

# ================= 3️⃣ EdgeRank với PageRank =================
pagerank_scores = nx.pagerank(G)

def calculate_edgerank(user_id, post_id):
    friends = list(G.neighbors(user_id))
    if not friends:
        return 0
    total_score = 0
    for friend in friends:
        friend_interactions = data[(data['user_id'] == friend) & (data['post_id'] == post_id)]
        for _, row in friend_interactions.iterrows():
            interaction_score = sum(row[feat] * weights[feat] for feat in weights)
            total_score += interaction_score * pagerank_scores.get(friend, 1)
    return total_score

# ================= 4️⃣ Collaborative Filtering (CF) =================
user_ids = data['user_id'].unique()
post_ids = data['post_id'].unique()
user_map = {user: i for i, user in enumerate(user_ids)}
post_map = {post: i for i, post in enumerate(post_ids)}
data['user_id'] = data['user_id'].map(user_map)
data['post_id'] = data['post_id'].map(post_map)
data['interaction_score'] = sum(data[feat] * weights[feat] for feat in weights)
data['interaction_score'] = (data['interaction_score'] - data['interaction_score'].min()) / (data['interaction_score'].max() - data['interaction_score'].min())

def build_and_train_model(train_data):
    num_users = len(user_map)
    num_articles = len(post_map)
    embedding_size = 16

    user_input = Input(shape=(1,))
    post_input = Input(shape=(1,))
    watch_time_input = Input(shape=(1,))  # Thêm thông tin watch_time

    user_embedding = Embedding(input_dim=num_users, output_dim=embedding_size)(user_input)
    post_embedding = Embedding(input_dim=num_articles, output_dim=embedding_size)(post_input)

    user_vec = Flatten()(user_embedding)
    post_vec = Flatten()(post_embedding)

    concat = Concatenate()([user_vec, post_vec, watch_time_input])
    fc = Dense(128, activation='relu')(concat)
    fc = Dropout(0.3)(fc)
    fc = Dense(64, activation='relu')(fc)
    fc = Dense(32, activation='relu')(fc)
    output = Dense(1, activation='sigmoid')(fc)

    model = Model([user_input, post_input, watch_time_input], output)
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])

    model.fit([train_data['user_id'], train_data['post_id'], train_data['watch_time']], train_data['interaction_score'], epochs=10, batch_size=16, validation_split=0.1)
    
    return model

# Chia dữ liệu ban đầu
train_data, test_data = train_test_split(data, test_size=0.2, random_state=42)

# Xây dựng và huấn luyện model ban đầu
model = build_and_train_model(train_data)

# ================= 5️⃣ Hybrid Recommendation Model =================
def hybrid_recommend(user_id, top_n=10):
    user_idx = user_map.get(user_id)
    if user_idx is None:
        return []
    
    article_candidates = np.array(list(post_map.values()))
    cf_scores = model.predict([np.full(len(article_candidates), user_idx), article_candidates, np.zeros(len(article_candidates))]).flatten()
    edge_scores = np.array([calculate_edgerank(user_id, post) for post in post_map.keys()])
    cbf_scores = np.array([calculate_cbf_score(user_id, post) for post in post_map.keys()])

    num_friends = len(list(G.neighbors(user_id)))
    avg_watch_time = data[data['user_id'] == user_id]['watch_time'].mean()
    if num_friends > 30 and avg_watch_time < 20:
        alpha, beta = 0.3, 0.5
    elif avg_watch_time > 40:
        alpha, beta = 0.6, 0.2
    else:
        alpha, beta = 0.5, 0.3
    
    final_scores = alpha * cf_scores + beta * edge_scores + (1 - alpha - beta) * cbf_scores
    top_indices = np.argsort(final_scores)[::-1][:top_n]
    recommended_articles = [list(post_map.keys())[i] for i in top_indices]
    return recommended_articles

# Hàm retrain model với dữ liệu mới
def retrain_model(new_data):
    global model
    # Kết hợp dữ liệu cũ và mới
    combined_data = pd.concat([train_data, new_data])
    # Huấn luyện lại model
    model = build_and_train_model(combined_data)

# # Ví dụ sử dụng retrain_model
# new_interactions = [{
#     "user_id": random.randint(1, 100),
#     "post_id": random.randint(1, 100),
#     "like": random.randint(0, 1),
#     "comment": random.randint(0, 1),
#     "share": random.randint(0, 1),
#     "dislike": random.randint(0, 1),
#     "watch_time": random.randint(0, 60),
#     "timestamp": fake.unix_time()
# } for i in range(1000)]

# new_data = pd.DataFrame(new_interactions)
# new_data['user_id'] = new_data['user_id'].map(user_map)
# new_data['post_id'] = new_data['post_id'].map(post_map)
# new_data['interaction_score'] = sum(new_data[feat] * weights[feat] for feat in weights)
# new_data['interaction_score'] = (new_data['interaction_score'] - new_data['interaction_score'].min()) / (new_data['interaction_score'].max() - new_data['interaction_score'].min())

# retrain_model(new_data)