import random
from faker import Faker
from app.models.user import User, Interaction
from app.models.post import Post
from app.models import db
from app import create_app  # Import Flask app

fake = Faker()

REACTIONS = ["like", "dislike", "comment", "share"]

app = create_app()  # Khởi tạo app

def create_users(num_users=10):
    users = []
    for _ in range(num_users):
        user = User(
            user_id=fake.uuid4(),
            friends=[],
            interactions=[]
        )
        users.append(user)

    for user in users:
        user.friends = random.sample(
            [u.user_id for u in users if u.user_id != user.user_id], 
            k=random.randint(2, 5)
        )

    User.objects.insert(users)
    return users

def create_posts(users, num_posts=20):
    posts = []
    for _ in range(num_posts):
        post = Post(
            post_id=fake.uuid4(),
            content=fake.sentence(),
            user_id=random.choice(users).user_id
        )
        posts.append(post)

    Post.objects.insert(posts)
    return posts

def create_interactions(users, posts):
    for user in users:
        num_interactions = random.randint(3, 8)
        interactions = [
            Interaction(
                post_id=random.choice(posts).post_id,
                reaction=random.choice(REACTIONS)
            )
            for _ in range(num_interactions)
        ]
        user.interactions = interactions
        user.save()

if __name__ == "__main__":
    with app.app_context():  # Đảm bảo chạy trong application context
        User.objects.delete()
        Post.objects.delete()
        users = create_users(10)
        posts = create_posts(users, 20)
        create_interactions(users, posts)
        print("✅ Dữ liệu mẫu đã được tạo thành công!")
