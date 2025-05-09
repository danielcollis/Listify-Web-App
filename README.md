# Listify - Social Wishlist Management App

## Overview

Listify is a social gift management application designed for online shoppers, gift planners, wedding registries, and social media influencers. It provides an intuitive and organized experience for tracking and sharing online wishlists across different platforms and categories.

## Features

- **User Authentication**: Secure login and registration system using Firebase Authentication
- **Create Multiple Wishlists**: Organize your items across different wishlists
- **Add Items from Any Website**: Not restricted to a single marketplace like Amazon
- **Customizable Item Details**: Add custom text, prices, and categorize your items
- **Price Tracking**: Monitor the total value of your wishlists
- **Easy Sharing**: Generate shareable links to send to friends and family
- **Purchase Status**: Track which items have been purchased
- **Filter Items**: Filter by price range and product categories
- **Add Experiences**: Save and share memorable experiences like vacations and activities

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Authentication
- **Hosting**: Github Pages

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/danielcollis/Listify-Web-App.git
   ```

2. Navigate to the project directory:
   ```
   cd Listify-Web-App
   ```

3. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication services
   - Update the Firebase configuration in your project files


## Project Structure

```
Listify Web App/
├── Login/            # Authentication related files
├── My_Wishlist/      # Wishlist management files
├── home.css          # Homepage styling
├── home.html         # Homepage
├── home.js           # Homepage functionality
├── list.css          # List page styling
├── list.html         # Individual wishlist page
├── list.js           # Wishlist functionality
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Usage

1. **Register/Login**: Create an account or log in to access your wishlists
2. **Create a Wishlist**: From the homepage, click "Create a New List"
3. **Add Items**: Enter the item link, custom text, price, and category
4. **Share Your Wishlist**: Click the "Share List" button to generate a shareable link
5. **Manage Items**: Mark items as purchased, edit details, or remove items
6. **Filter Items**: Use the filter options to view items by price range or category

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
