#v1, a college learning project. A professional rebuild with tests, concurrency control and CI is in progress at car-rental-api.

# 🚗 Car Rental System

A full-stack web application for managing car rentals, built with Django and Django REST Framework.

## 🔧 Features

- 🔐 User registration and JWT authentication
- 📦 Car listings and details
- 📅 Booking management
- ❤️ Save favorites to localStorage (React Frontend)
- 🛠 Admin dashboard for car and booking management

## 🏗 Tech Stack

- **Backend:** Django, Django REST Framework, SimpleJWT
- **Frontend:** React (assumed from context)
- **Database:** PostgreSQL

## 🚀 Getting Started

### Backend Setup

1. **Clone the repo:**

   ```bash
   git clone https://github.com/yourusername/car-rental-system.git
   cd car-rental-system/Car\ Rental\ System/project
   ```

2. **Create virtual environment and activate:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure PostgreSQL in `settings.py`:**

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'your_db_name',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. **Apply migrations:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Run the development server:**

   ```bash
   python manage.py runserver
   ```

7. **Create a superuser (for admin panel):**

   ```bash
   python manage.py createsuperuser
   ```

## 🔐 Authentication

Uses JWT via `djangorestframework-simplejwt`.

- Obtain token: `api/users/token/`
- Refresh token: `api/users/token/refresh/`



