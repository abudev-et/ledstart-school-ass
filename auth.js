import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCN6YgQ5UZKeXKr2Xnu6NOI19GKaInDEcs",
    authDomain: "abdu-school.firebaseapp.com",
    databaseURL: "https://abdu-school-default-rtdb.firebaseio.com",
    projectId: "abdu-school",
    storageBucket: "abdu-school.firebasestorage.app",
    messagingSenderId: "511143470648",
    appId: "1:511143470648:web:1bf8943b322b725b1ea8cd",
    measurementId: "G-CFTFM2W1W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle login
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error');
    const loadingElement = document.getElementById('loading');
    const loginContainer = document.getElementById('login-container');

    errorElement.textContent = "";
    if (loadingElement) loadingElement.style.display = "block";  // Show loading
    if (loginContainer) loginContainer.style.display = "none";   // Hide form temporarily

    if (!email || !password) {
        errorElement.textContent = "Please enter both email and password.";
        if (loadingElement) loadingElement.style.display = "none";  
        if (loginContainer) loginContainer.style.display = "block"; // Show form again
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            const userDocRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(userDocRef);

            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const role = userData.role;

                // Save user info in localStorage
                localStorage.setItem("user", JSON.stringify({ uid: user.uid, role: role, name: userData.name }));

                // Redirect based on role
                if (role === "admin") {
                    window.location.href = "admin.html";
                } else if (role === "student") {
                    window.location.href = "student.html";
                }
            } else {
                errorElement.textContent = "User data not found.";
            }
        })
        .catch(() => {
            errorElement.textContent = "Check email or password.";
        })
        .finally(() => {
            loadingElement.style.display = "none";  // Hide loading after login
            loginContainer.style.display = "block"; // Show form again if login fails
        });
}


// Function to create a new student (by Admin)
function createStudent() {
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('student-email').value;
    const password = document.getElementById('student-password').value;
    const messageElement = document.getElementById('student-message');
    const studentLoadingElement = document.getElementById('student-loading');
    const studentForm = document.getElementById('student-form');

    messageElement.textContent = "";
    studentLoadingElement.style.display = "block"; // Show loading
    studentForm.style.display = "none"; // Hide form temporarily

    if (!name || !email || !password) {
        messageElement.textContent = "Please fill in all fields.";
        studentLoadingElement.style.display = "none"; // Hide loading
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Save student info in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: "student"
            });
            studentLoadingElement.style.display = "none"; 
            studentForm.style.display = "block";
            messageElement.textContent = "Student created successfully!";
        })
        .catch((error) => {
            messageElement.textContent = "Error: " + error.message;
        })
        .finally(() => {
            studentLoadingElement.style.display = "none"; // Hide loading after student creation
        });
}

function displayStudentName() {
    const user = JSON.parse(localStorage.getItem("user"));
    const welcomeElement = document.getElementById("welcome-message");
    
    if (user && user.role === "student" && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.name}!`;
    }
}


// Logout function
function logout() {
    signOut(auth).then(() => {
        localStorage.removeItem("user");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
}

// Check if the user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
    } else if (user.role === "student") {
        displayStudentName();
    }
}

// Redirect user if already logged in (from login page)
function redirectIfLoggedIn() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else if (user.role === "student") {
            window.location.href = "student.html";
        }
    }
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById('login');
    if (loginButton) {
        loginButton.addEventListener('click', login);
        redirectIfLoggedIn();
    }

    const createStudentButton = document.getElementById('create-student');
    if (createStudentButton) {
        createStudentButton.addEventListener('click', createStudent);
    }

    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

// Auto-check if a user is logged in when opening protected pages
if (window.location.pathname.includes("admin.html") || window.location.pathname.includes("student.html")) {
    checkAuth();
}
