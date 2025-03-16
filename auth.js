import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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

// Function to log in user
function login() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const errorElement = document.getElementById('error');

    if (!email || !password) {
        errorElement.textContent = "Please enter both email and password.";
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

                // Store user info in localStorage
                localStorage.setItem("user", JSON.stringify({ uid: user.uid, role: role }));

                // Redirect based on role
                if (role === "admin") {
                    window.location.href = "admin.html";
                } else if (role === "student") {
                    window.location.href = "student.html";
                } else {
                    alert("Role not defined.");
                }
            } else {
                alert("User data not found.");
            }
        })
        .catch((error) => {
            errorElement.textContent = error.message;
        });
}

// Function to check user session
function checkUserSession() {
    document.addEventListener("DOMContentLoaded", () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            if (storedUser.role === "admin" && window.location.pathname.includes("index.html")) {
                window.location.href = "admin.html";
            } else if (storedUser.role === "student" && window.location.pathname.includes("index.html")) {
                window.location.href = "student.html";
            }
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('user'); // Remove user session
    window.location.href = "index.html"; // Redirect to login page
}

// Check if login button exists before attaching event listener
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('login')) {
        document.getElementById('login').addEventListener('click', login);
        checkUserSession(); // Only check session on login page
    }
});

// Export logout function for use in admin & student pages
export { logout }