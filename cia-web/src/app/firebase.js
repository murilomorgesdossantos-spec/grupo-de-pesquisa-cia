import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged,
    signOut 
} from "firebase/auth";
import { 
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    where, 
    limit
} from "firebase/firestore";

// 1. Configuração Segura (Puxando do .env.local)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 2. Inicialização do Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };

// ==========================================
// 3. MÓDULO DE AUTENTICAÇÃO
// ==========================================
export const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",
        createdAt: serverTimestamp()
    });
    
    return userCredential;
};

export const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let isNewUser = false;
    let suggestedFirstName = "";
    let suggestedLastName = "";

    // Se o documento não existe, é uma conta nova! Não salvamos nada ainda.
    if (!userDoc.exists()) {
        isNewUser = true;
        const fullName = user.displayName || "";
        const nameParts = fullName.split(" ");
        suggestedFirstName = nameParts[0] || "";
        suggestedLastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    }

    // Retornamos os dados para a tela de Login decidir o que fazer
    return { userCredential, isNewUser, suggestedFirstName, suggestedLastName };
};

// NOVA FUNÇÃO: Chamada apenas quando a pessoa confirmar o nome na tela
export const completeGoogleRegistration = async (uid, email, firstName, lastName) => {
    await setDoc(doc(db, "users", uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        createdAt: serverTimestamp()
    });
};

export const logoutUser = async () => await signOut(auth);

export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
};

// ==========================================
// 4. MÓDULO DE AUTORIZAÇÃO E USUÁRIOS
// ==========================================
export const isAdmin = async (uid) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists() && userDoc.data().role === "admin";
    } catch (error) {
        return false;
    }
};

export const getUsersList = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const updateUserRole = async (uid, newRole) => {
    const userRef = doc(db, "users", uid);
    return await updateDoc(userRef, { role: newRole });
};

// ==========================================
// 5. MÓDULO DE PROJETOS (CRUD)
// ==========================================
export const createProject = async (data) => {
    return await addDoc(collection(db, "projects"), {
        ...data,
        createdAt: serverTimestamp()
    });
};

export const getProjects = async () => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateProject = async (id, data) => {
    const projectRef = doc(db, "projects", id);
    return await updateDoc(projectRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteProject = async (id) => {
    const projectRef = doc(db, "projects", id);
    return await deleteDoc(projectRef);
};

export const getProjectBySlug = async (slug) => {
    const q = query(collection(db, "projects"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// ==========================================
// 6. MÓDULO DO FÓRUM (POSTS)
// ==========================================
export const createPost = async (title, content, userId, userEmail, authorName) => {
    return await addDoc(collection(db, "posts"), {
        title,
        content,
        userId,
        userEmail,
        authorName: authorName || userEmail.split('@')[0], // Se não tiver nome cadastrado, usa o e-mail
        createdAt: serverTimestamp()
    });
};

export const getPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const posts = [];
    const userCache = {}; // Cache para não sobrecarregar o banco buscando a mesma pessoa várias vezes

    for (const docSnap of snapshot.docs) {
        const postData = docSnap.data();
        const uid = postData.userId;

        // Se ainda não buscamos os dados desse usuário, vamos buscar na coleção 'users'
        if (!userCache[uid]) {
            const userDoc = await getDoc(doc(db, "users", uid));
            userCache[uid] = userDoc.exists() ? userDoc.data() : null;
        }

        const userData = userCache[uid];
        
        // Atualiza o nome do autor em tempo real para o post
        if (userData && userData.firstName) {
            postData.authorName = `${userData.firstName} ${userData.lastName}`;
        } else if (userData && userData.email) {
            postData.authorName = userData.email.split('@')[0];
        }

        posts.push({ id: docSnap.id, ...postData });
    }
    
    return posts;
};

// Adicione isto LOGO ABAIXO da função getPosts no Módulo 6
export const addComment = async (postId, content, userId, authorName) => {
    // Cria uma "subcoleção" de comentários dentro do post específico
    return await addDoc(collection(db, `posts/${postId}/comments`), {
        content,
        userId,
        authorName,
        createdAt: serverTimestamp()
    });
};

export const getComments = async (postId) => {
    const q = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    
    const comments = [];
    const userCache = {}; // Cache para deixar super rápido

    for (const docSnap of snapshot.docs) {
        const commentData = docSnap.data();
        const uid = commentData.userId;

        // Puxa o nome da coleção users, igual fazemos nos posts!
        if (!userCache[uid]) {
            const userDoc = await getDoc(doc(db, "users", uid));
            userCache[uid] = userDoc.exists() ? userDoc.data() : null;
        }

        const userData = userCache[uid];
        
        if (userData && userData.firstName) {
            commentData.authorName = `${userData.firstName} ${userData.lastName}`;
        } else if (userData && userData.email) {
            commentData.authorName = userData.email.split('@')[0];
        }

        comments.push({ id: docSnap.id, ...commentData });
    }
    
    return comments;
};

// Adicione LOGO ABAIXO da função getComments no Módulo 6
export const softDeletePost = async (postId, deletedBy) => {
    const postRef = doc(db, "posts", postId);
    return await updateDoc(postRef, {
        deleted: true,
        deletedBy: deletedBy // Pode ser 'admin' ou 'author'
    });
};

export const softDeleteComment = async (postId, commentId, deletedBy) => {
    const commentRef = doc(db, `posts/${postId}/comments`, commentId);
    return await updateDoc(commentRef, {
        deleted: true,
        deletedBy: deletedBy // Pode ser 'admin' ou 'author'
    });
};

// ==========================================
// 7. MÓDULO DE PERFIL DO USUÁRIO
// ==========================================
export const getUserProfile = async (uid) => {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (uid, data) => {
    // O { merge: true } garante que o Firebase não apague o "role" ou o "email" 
    // quando for atualizar apenas o nome e o Lattes!
    await setDoc(doc(db, "users", uid), data, { merge: true });
};