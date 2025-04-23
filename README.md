# Listify - Social Wishlist Management App

## Overview

Listify is a social gift management application designed for online shoppers, gift planners, wedding registries, and social media influencers. It provides an intuitive and organized experience for tracking and sharing online wishlists across different platforms and categories.

**FOR** frequent online shoppers, gift planners, wedding registries, and social media influencers **WHO** need a seamless way to save and share the items and services they intend to buy, Listify is a social gift management application **THAT** provides an intuitive, and organized experience for tracking and sharing online wishlists. 
**UNLIKE** other wishlist applications such as Amazon, **OUR PRODUCT** fosters effortless sharing with friends, family, and social networks, while also allowing users to add memorable experiences, such as vacations, hotel stays, and unique activities.

## Features

- **User Authentication**: Secure login and registration system using Firebase Authentication
- **Create Multiple Wishlists**: Organize your items across different wishlists
- **Add Items from Any Website**: Not restricted to a single marketplace like Amazon
- **Customizable Item Details**: Add custom text, prices, and categorize your items
- **Price Tracking**: Monitor the total value of your wishlists
- **Easy Sharing**: Generate shareable links to send to friends and family
- **Purchase Status**: Track which items have been purchased
- **Filter Items**: Filter by price range and product categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Add Experiences**: Save and share memorable experiences like vacations and activities

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Authentication
- **Hosting**: [Your hosting platform]

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/danielcollis/Listify-Web-App.git
   ```

2. Navigate to the project directory:
   ```
   cd Listify-Web-App
   ```

3. No npm installation required - the project uses Firebase via CDN imports

4. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication services
   - Update the Firebase configuration in the project files (look for the `firebaseConfig` object in your HTML files)

5. Deploy or serve the files locally using your preferred web server

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
├── package.json      # Firebase dependency reference
└── README.md         # Project documentation
```

## Usage

1. **Register/Login**: Create an account or log in to access your wishlists
2. **Create a Wishlist**: From the homepage, click "Create a New List"
3. **Add Items**: Enter the item link, custom text, price, and category
4. **Share Your Wishlist**: Click the "Share List" button to generate a shareable link
5. **Manage Items**: Mark items as purchased, edit details, or remove items
6. **Filter Items**: Use the filter options to view items by price range or category

## Development

### Prerequisites

- Firebase account
- A modern web browser
- Basic web server for local development (can be as simple as VS Code's Live Server extension)

### Setting Up Development Environment

1. Configure Firebase for development:
   - Create a development project in Firebase
   - Enable Authentication and Firestore services
   - Update the Firebase configuration in your HTML files

2. Serve the application files locally using a basic web server

## Deployment

You can deploy this application to various hosting platforms:

1. **Firebase Hosting** (Recommended)
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize your project: `firebase init`
   - Deploy: `firebase deploy`

2. **Other static hosting options**:
   - GitHub Pages
   - Netlify
   - Vercel
   - Amazon S3

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

[Your license information]

## Contact

Daniel Collis - [Your contact information]

Project Link: [https://github.com/danielcollis/Listify-Web-App](https://github.com/danielcollis/Listify-Web-App)

## Acknowledgements

- [Firebase](https://firebase.google.com/)
- [Other libraries or resources used]
