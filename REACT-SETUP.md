# Multi-Page Form Application - React Version

## Setup Instructions for React Version

### 1. Install Node.js Dependencies

Make sure you have Node.js installed (v16 or higher). Then install dependencies:

```bash
cd "C:\Users\HP\OneDrive\Desktop\Forms"
npm install
```

This will install React and Vite build tools.

### 2. Keep Backend Running

The FastAPI backend should still be running:

```bash
# In another PowerShell terminal
cd "C:\Users\HP\OneDrive\Desktop\Forms"
.\venv\Scripts\Activate.ps1
python main.py
```

The backend will run at `http://localhost:8000`

### 3. Start React Development Server

```bash
# In the main terminal
npm run dev
```

This will start Vite development server at `http://localhost:3000` and open it automatically.

### 4. Build for Production

```bash
npm run build
```

This creates a production build in the `dist` folder.

## Project Structure - React Version

```
Forms/
├── src/
│   ├── components/
│   │   ├── FormContainer.jsx      # Main form logic
│   │   ├── FormPage.jsx           # Individual form page
│   │   ├── SuccessPage.jsx        # Success page
│   │   ├── ErrorMessage.jsx       # Error display
│   │   └── LoadingIndicator.jsx   # Loading spinner
│   ├── App.jsx                    # Main App component
│   ├── App.css                    # App styles
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Entry point
├── index-react.html               # HTML template for Vite
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies
├── main.py                        # FastAPI backend
├── .env                           # Database config
└── ...other files
```

## Features - Same as Before

✅ 4-page multi-step form
✅ Auto-save functionality
✅ Previous/Next navigation
✅ Progress bar
✅ Form submission
✅ Success page
✅ Database persistence (PostgreSQL)
✅ Responsive design

## How It Works

### Frontend (React)
- **FormContainer**: Manages form state and API calls
- **FormPage**: Renders individual form pages with textarea input
- **SuccessPage**: Shows success message after submission
- **Auto-save**: Debounced saving when user stops typing or leaves field
- **Hooks**: Uses `useState`, `useCallback`, `useEffect` for state management

### Backend (FastAPI)
- Same as before - handles form sessions and answer storage
- Runs on `http://localhost:8000`

## Key Differences from Vanilla JS

| Feature | Vanilla JS | React |
|---------|-----------|-------|
| State Management | Manual variables | React State (useState) |
| Component Structure | Single HTML file | Modular JSX components |
| Re-renders | Manual DOM updates | Automatic virtual DOM |
| Build System | None needed | Vite |
| File Structure | HTML, CSS, JS | src/ with components |

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will use the next available port.

### npm install fails
Make sure Node.js is installed:
```bash
node --version
npm --version
```

### Backend connection errors
Ensure FastAPI backend is running on `http://localhost:8000`

## Switching Back to Vanilla Version

The original vanilla JS version is still available:
- `index.html` - Original vanilla JS version
- Use `npm run dev` for React version

Both versions work with the same backend!
