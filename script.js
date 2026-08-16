// ======================================================
// SUBRAT BARIK - STUDENT PORTFOLIO
// LOGIN + PERSONAL DETAILS + DOCUMENT STORAGE
// ======================================================


// ======================================================
// LOGIN
// ======================================================

function openLogin() {

    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "flex";
    }

}


function closeLogin() {

    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "none";
    }

}


// ======================================================
// LOGIN FUNCTION
// ======================================================

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");


    if (username === "admin" && password === "1234") {

        closeLogin();


        // Hide public website
        document
            .querySelectorAll("section, header, footer")
            .forEach(element => {

                element.style.display = "none";

            });


        // Show dashboard
        const dashboard =
            document.getElementById("dashboard");


        if (dashboard) {

            dashboard.style.display = "block";

        }


        // Load saved personal details
        loadDetails();


        // Load documents from IndexedDB
        try {

            await documentsReady;

            await loadDocuments();

            displayDocuments();

        } catch (error) {

            console.error(
                "Document database error:",
                error
            );

            alert(
                "⚠️ Document storage could not be opened."
            );

        }

    }

    else {

        if (message) {

            message.innerText =
                "❌ Wrong username or password";

            message.style.color = "#ff6b6b";

        }

    }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    const dashboard =
        document.getElementById("dashboard");


    if (dashboard) {

        dashboard.style.display = "none";

    }


    // Show public website again
    document
        .querySelectorAll("section, header, footer")
        .forEach(element => {

            element.style.display = "";

        });


    // Clear login fields
    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    const message =
        document.getElementById("loginMessage");


    if (username) {
        username.value = "";
    }


    if (password) {
        password.value = "";
    }


    if (message) {
        message.innerText = "";
    }


    window.scrollTo(0, 0);

}


// ======================================================
// PERSONAL DETAILS
// ======================================================

function saveDetails() {

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const college =
        document.getElementById("college");

    const course =
        document.getElementById("course");

    const location =
        document.getElementById("location");


    const details = {

        name:
            fullName ? fullName.value.trim() : "",

        email:
            email ? email.value.trim() : "",

        phone:
            phone ? phone.value.trim() : "",

        college:
            college ? college.value.trim() : "",

        course:
            course ? course.value.trim() : "",

        location:
            location ? location.value.trim() : ""

    };


    try {

        localStorage.setItem(
            "studentDetails",
            JSON.stringify(details)
        );


        alert(
            "✅ Personal details saved successfully!"
        );

    }

    catch (error) {

        console.error(
            "Personal details storage error:",
            error
        );


        alert(
            "❌ Personal details could not be saved."
        );

    }

}


// ======================================================
// LOAD PERSONAL DETAILS
// ======================================================

function loadDetails() {

    try {

        const saved =
            localStorage.getItem("studentDetails");


        if (!saved) {

            return;

        }


        const details =
            JSON.parse(saved);


        const fullName =
            document.getElementById("fullName");

        const email =
            document.getElementById("email");

        const phone =
            document.getElementById("phone");

        const college =
            document.getElementById("college");

        const course =
            document.getElementById("course");

        const location =
            document.getElementById("location");


        if (fullName) {
            fullName.value =
                details.name || "";
        }


        if (email) {
            email.value =
                details.email || "";
        }


        if (phone) {
            phone.value =
                details.phone || "";
        }


        if (college) {
            college.value =
                details.college || "";
        }


        if (course) {
            course.value =
                details.course || "";
        }


        if (location) {
            location.value =
                details.location || "";
        }

    }

    catch (error) {

        console.error(
            "Personal details loading error:",
            error
        );

    }

}


// ======================================================
// INDEXEDDB DOCUMENT STORAGE
// ======================================================

const DB_NAME =
    "SubratBarikPortfolioDB";

const DB_VERSION = 1;

const STORE_NAME =
    "documents";


let db = null;

let documents = [];


// Create database connection
function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        request.onupgradeneeded =
            function (event) {

                const database =
                    event.target.result;


                if (
                    !database.objectStoreNames.contains(
                        STORE_NAME
                    )
                ) {

                    const store =
                        database.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );


                    store.createIndex(
                        "name",
                        "name",
                        {
                            unique: false
                        }
                    );

                }

            };


        request.onsuccess =
            function (event) {

                db =
                    event.target.result;

                resolve(db);

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ======================================================
// DATABASE INITIALIZATION
// ======================================================

async function initializeDatabase() {

    try {

        await openDatabase();

        await migrateOldDocuments();

        await loadDocuments();

        console.log(
            "✅ Document database ready."
        );

    }

    catch (error) {

        console.error(
            "❌ Database initialization failed:",
            error
        );

        throw error;

    }

}


const documentsReady =
    initializeDatabase();


// ======================================================
// LOAD DOCUMENTS FROM INDEXEDDB
// ======================================================

function loadDocuments() {

    return new Promise((resolve, reject) => {

        if (!db) {

            reject(
                new Error(
                    "Database is not connected."
                )
            );

            return;

        }


        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.getAll();


        request.onsuccess =
            function () {

                documents =
                    request.result || [];


                // Newest document first
                documents.sort(
                    (a, b) =>
                        (b.createdAt || b.id) -
                        (a.createdAt || a.id)
                );


                resolve(
                    documents
                );

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ======================================================
// SAVE DOCUMENT TO INDEXEDDB
// ======================================================

function saveDocumentToDatabase(fileData) {

    return new Promise((resolve, reject) => {

        if (!db) {

            reject(
                new Error(
                    "Database is not connected."
                )
            );

            return;

        }


        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.put(fileData);


        request.onsuccess =
            function () {

                resolve();

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ======================================================
// DELETE DOCUMENT FROM INDEXEDDB
// ======================================================

function deleteDocumentFromDatabase(id) {

    return new Promise((resolve, reject) => {

        if (!db) {

            reject(
                new Error(
                    "Database is not connected."
                )
            );

            return;

        }


        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                STORE_NAME
            );


        const request =
            store.delete(id);


        request.onsuccess =
            function () {

                resolve();

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ======================================================
// MIGRATE OLD LOCALSTORAGE DOCUMENTS
// ======================================================

async function migrateOldDocuments() {

    const oldData =
        localStorage.getItem(
            "documents"
        );


    if (!oldData) {

        return;

    }


    try {

        const oldDocuments =
            JSON.parse(oldData);


        if (
            !Array.isArray(oldDocuments) ||
            oldDocuments.length === 0
        ) {

            localStorage.removeItem(
                "documents"
            );

            return;

        }


        console.log(
            "Migrating old documents..."
        );


        for (
            const oldFile of oldDocuments
        ) {

            if (!oldFile.data) {

                continue;

            }


            const blob =
                dataURLToBlob(
                    oldFile.data
                );


            const newFile = {

                id:
                    oldFile.id ||
                    Date.now() +
                    Math.random(),

                name:
                    oldFile.name ||
                    oldFile.fileName ||
                    "Document",

                fileName:
                    oldFile.fileName ||
                    "document",

                type:
                    oldFile.type ||
                    blob.type ||
                    "application/octet-stream",

                size:
                    oldFile.size ||
                    blob.size,

                blob:
                    blob,

                createdAt:
                    oldFile.id ||
                    Date.now()

            };


            await saveDocumentToDatabase(
                newFile
            );

        }


        // Remove old LocalStorage data
        localStorage.removeItem(
            "documents"
        );


        console.log(
            "✅ Old documents migrated successfully."
        );

    }

    catch (error) {

        console.error(
            "Old document migration failed:",
            error
        );

    }

}


// ======================================================
// DATA URL TO BLOB
// ======================================================

function dataURLToBlob(dataURL) {

    const parts =
        dataURL.split(",");


    const metadata =
        parts[0];


    const base64 =
        parts[1];


    const match =
        metadata.match(
            /data:(.*?);base64/
        );


    const mimeType =
        match
            ? match[1]
            : "application/octet-stream";


    const binary =
        atob(base64);


    const length =
        binary.length;


    const bytes =
        new Uint8Array(length);


    for (
        let i = 0;
        i < length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }


    return new Blob(
        [bytes],
        {
            type: mimeType
        }
    );

}


// ======================================================
// UPLOAD DOCUMENT
// ======================================================

async function uploadDocument() {

    const fileInput =
        document.getElementById(
            "documentInput"
        );


    const nameInput =
        document.getElementById(
            "documentName"
        );


    if (!fileInput) {

        alert(
            "❌ File input not found."
        );

        return;

    }


    if (!nameInput) {

        alert(
            "❌ Document name input not found."
        );

        return;

    }


    if (
        !fileInput.files ||
        fileInput.files.length === 0
    ) {

        alert(
            "❌ Please select a PDF, JPG or PNG file first."
        );

        return;

    }


    const selectedFile =
        fileInput.files[0];


    const documentName =
        nameInput.value.trim();


    if (documentName === "") {

        alert(
            "❌ Please enter a document name."
        );

        return;

    }


    // ==================================================
    // FILE TYPE CHECK
    // ==================================================

    const allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];


    const allowedExtensions = [

        ".pdf",

        ".jpg",

        ".jpeg",

        ".png"

    ];


    const fileName =
        selectedFile.name.toLowerCase();


    const hasValidType =
        allowedTypes.includes(
            selectedFile.type
        );


    const hasValidExtension =
        allowedExtensions.some(
            extension =>
                fileName.endsWith(extension)
        );


    if (
        !hasValidType &&
        !hasValidExtension
    ) {

        alert(
            "❌ Only PDF, JPG, JPEG and PNG files are allowed."
        );

        return;

    }


    // ==================================================
    // FILE SIZE
    // ==================================================

    // 25 MB maximum
    const maxSize =
        25 * 1024 * 1024;


    if (
        selectedFile.size >
        maxSize
    ) {

        alert(
            "❌ File is too large.\n\n" +
            "Maximum allowed size is 25 MB."
        );

        return;

    }


    try {

        // Wait for database
        await documentsReady;


        // Create document object
        const newFile = {

            id:
                Date.now() +
                Math.floor(
                    Math.random() * 1000
                ),

            name:
                documentName,

            fileName:
                selectedFile.name,

            type:
                selectedFile.type ||
                getFileTypeFromExtension(
                    selectedFile.name
                ),

            size:
                selectedFile.size,

            blob:
                selectedFile,

            createdAt:
                Date.now()

        };


        // Save in IndexedDB
        await saveDocumentToDatabase(
            newFile
        );


        // Reload documents
        await loadDocuments();


        // Clear input
        fileInput.value = "";

        nameInput.value = "";


        // Update display
        displayDocuments();


        alert(
            "✅ Document uploaded successfully!\n\n" +
            "Your document is now stored in the browser."
        );

    }

    catch (error) {

        console.error(
            "Upload error:",
            error
        );


        alert(
            "❌ Upload failed.\n\n" +
            "Browser storage may be unavailable or full."
        );

    }

}


// ======================================================
// GET FILE TYPE FROM EXTENSION
// ======================================================

function getFileTypeFromExtension(fileName) {

    const name =
        fileName.toLowerCase();


    if (
        name.endsWith(".pdf")
    ) {

        return "application/pdf";

    }


    if (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg")
    ) {

        return "image/jpeg";

    }


    if (
        name.endsWith(".png")
    ) {

        return "image/png";

    }


    return "application/octet-stream";

}


// ======================================================
// DISPLAY DOCUMENTS
// ======================================================

function displayDocuments() {

    const list =
        document.getElementById(
            "documentList"
        );


    const searchInput =
        document.getElementById(
            "searchDocument"
        );


    if (!list) {

        return;

    }


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    list.innerHTML = "";


    const filteredFiles =
        documents.filter(file => {

            const fileName =
                String(
                    file.fileName || ""
                ).toLowerCase();


            const name =
                String(
                    file.name || ""
                ).toLowerCase();


            return (
                name.includes(
                    searchText
                ) ||
                fileName.includes(
                    searchText
                )
            );

        });


    // No documents
    if (
        filteredFiles.length === 0
    ) {

        list.innerHTML = `

            <p style="
                color:#8da2b5;
                padding:15px;
            ">

                📂 No documents found.

            </p>

        `;

        return;

    }


    // Create document cards
    filteredFiles.forEach(file => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "document-item";


        const size =
            formatFileSize(
                file.size
            );


        item.innerHTML = `

            <div class="document-info">

                <h3>
                    📄 ${escapeHTML(file.name)}
                </h3>

                <p>
                    ${escapeHTML(file.fileName)}
                    • ${size}
                </p>

            </div>


            <div class="document-actions">

                <button
                    type="button"
                    onclick="viewDocument(${file.id})">

                    👁️ View

                </button>


                <button
                    type="button"
                    onclick="downloadDocument(${file.id})">

                    ⬇️ Download

                </button>


                <button
                    type="button"
                    onclick="deleteDocument(${file.id})">

                    🗑️ Delete

                </button>

            </div>

        `;


        list.appendChild(item);

    });

}


// ======================================================
// VIEW DOCUMENT
// ======================================================

function viewDocument(id) {

    const file =
        documents.find(
            item =>
                item.id === id
        );


    if (!file) {

        alert(
            "❌ Document not found."
        );

        return;

    }


    if (!file.blob) {

        alert(
            "❌ Document data is unavailable."
        );

        return;

    }


    try {

        const blob =
            file.blob instanceof Blob
                ? file.blob
                : new Blob(
                    [file.blob],
                    {
                        type:
                            file.type
                    }
                );


        const url =
            URL.createObjectURL(
                blob
            );


        const newWindow =
            window.open(
                url,
                "_blank"
            );


        if (!newWindow) {

            URL.revokeObjectURL(
                url
            );


            alert(
                "❌ Pop-up blocked.\n\n" +
                "Please allow pop-ups for this website."
            );

            return;

        }


        // Keep URL alive for a while
        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            60000
        );

    }

    catch (error) {

        console.error(
            "View error:",
            error
        );


        alert(
            "❌ Document could not be opened."
        );

    }

}


// ======================================================
// DOWNLOAD DOCUMENT
// ======================================================

function downloadDocument(id) {

    const file =
        documents.find(
            item =>
                item.id === id
        );


    if (!file) {

        alert(
            "❌ Document not found."
        );

        return;

    }


    if (!file.blob) {

        alert(
            "❌ Document data is unavailable."
        );

        return;

    }


    try {

        const blob =
            file.blob instanceof Blob
                ? file.blob
                : new Blob(
                    [file.blob],
                    {
                        type:
                            file.type
                    }
                );


        const url =
            URL.createObjectURL(
                blob
            );


        const downloadLink =
            document.createElement(
                "a"
            );


        downloadLink.href =
            url;


        downloadLink.download =
            file.fileName ||
            file.name ||
            "document";


        document.body.appendChild(
            downloadLink
        );


        downloadLink.click();


        document.body.removeChild(
            downloadLink
        );


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    }

    catch (error) {

        console.error(
            "Download error:",
            error
        );


        alert(
            "❌ Document could not be downloaded."
        );

    }

}


// ======================================================
// DELETE DOCUMENT
// ======================================================

async function deleteDocument(id) {

    const file =
        documents.find(
            item =>
                item.id === id
        );


    if (!file) {

        alert(
            "❌ Document not found."
        );

        return;

    }


    const confirmDelete =
        confirm(
            `Are you sure you want to delete "${file.name}"?`
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await documentsReady;


        await deleteDocumentFromDatabase(
            id
        );


        await loadDocuments();


        displayDocuments();


        alert(
            "🗑️ Document deleted successfully!"
        );

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "❌ Document could not be deleted."
        );

    }

}


// ======================================================
// FILE SIZE
// ======================================================

function formatFileSize(bytes) {

    if (!bytes || bytes === 0) {

        return "0 B";

    }


    if (
        bytes <
        1024
    ) {

        return (
            bytes + " B"
        );

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            (bytes / 1024)
                .toFixed(1)
        ) + " KB";

    }


    if (
        bytes <
        1024 * 1024 * 1024
    ) {

        return (
            (bytes / (1024 * 1024))
                .toFixed(1)
        ) + " MB";

    }


    return (
        (bytes /
            (1024 * 1024 * 1024))
            .toFixed(1)
    ) + " GB";

}


// ======================================================
// SECURITY - ESCAPE HTML
// ======================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// ======================================================
// PROJECT MESSAGE
// ======================================================

function projectMessage() {

    alert(
        "🚀 Project details will be added soon!"
    );

}


// ======================================================
// INITIALIZE WEBSITE
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Load saved personal details
        loadDetails();


        try {

            await documentsReady;

            console.log(
                "✅ Portfolio storage initialized."
            );

        }

        catch (error) {

            console.error(
                "Storage initialization error:",
                error
            );

        }

    }
);