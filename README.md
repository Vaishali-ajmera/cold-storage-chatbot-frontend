# Cold Storage Advisory - Frontend

A modern, ChatGPT-style advisory chatbot for cold storage management built with React, TypeScript, and Vite.

## 🌟 Features

### **Authentication System**
- ✅ **User Signup/Registration** with auto-login
- ✅ **Email + Password Login**
- ✅ **Forgot Password Flow** (OTP-based password reset)
- ✅ **Password Strength Indicator**
- ✅ **Automatic Token Refresh**
- ✅ **Protected Routes**

### **Chat & Advisory System**
- ✅ **User Intake Form** with suggested questions
- ✅ **Interactive Chat Interface** with text and MCQ responses
- ✅ **Session Management** (list, switch, rename sessions)
- ✅ **Chat History Persistence**
- ✅ **4 Questions Per Session Limit**
- ✅ **ChatGPT-style Layout** with sidebar and main chat area

### **Design & UX**
- ✅ **Responsive Design** with modern UI/UX
- ✅ **Real-time Validation**
- ✅ **Loading States & Animations**
- ✅ **Error Handling**

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running (see backend setup)

### Installation

1. **Clone the repository:**
   ```bash
   cd cold-storage-fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   
   Update `VITE_API_URL` to point to your backend API.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```
## 🔐 Authentication Flows

### **Signup Flow**
1. User fills signup form (name, email, password)
2. Backend validates and creates account
3. Returns JWT tokens
4. Auto-login and redirect to dashboard

### **Login Flow**
1. User enters email and password
2. Backend validates credentials
3. Returns JWT tokens
4. Redirect to dashboard

### **Forgot Password Flow**
1. User requests OTP via email
2. Backend sends 6-digit OTP (15min expiry)
3. User verifies OTP
4. User sets new password
5. Success → redirect to login

### **Token Management**
- Access token stored in localStorage
- Automatic refresh on token expiry
- Auto-redirect to login on auth failure

## 💬 Chat Flow

1. **First-Time User:**
   - Fill out intake form
   - Get suggested questions
   - Click question to start chat session

2. **Returning User:**
   - See previous sessions in sidebar
   - Click session to load chat history
   - Create new session anytime

3. **Chat Session:**
   - Ask questions (max 4 per session)
   - Receive text or MCQ responses
   - Get suggested follow-up questions
   - Session auto-completes after 4 questions

## 🎨 UI/UX Highlights

- **Modern Design:** Clean, professional interface with emerald green theme
- **Smooth Animations:** Loading states, transitions, and micro-interactions
- **Responsive Layout:** Works on desktop, tablet, and mobile
- **ChatGPT-style:** Familiar interface with sidebar and chat area
- **User-Friendly:** Clear feedback, helpful suggestions, and intuitive navigation

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build


## 🛠️ Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling (via CDN)

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL |



**Built with ❤️ for Cold Storage Advisory**
