// to learn how to download a file, get/use file metadata, delete files, 
// and list files see https://firebase.google.com/docs/storage/web/start

import { useRef, useState } from "react";

// ✅ USE the initialized storage instance from your firebaseConfig.js
import { storage } from "../../lib/firebase/firebaseConfig";

import {
    ref,
    uploadBytesResumable
} from "firebase/storage";

const UploadFile = () => {
    const inputEl = useRef(null);
    let [value, setValue] = useState(0);

    function uploadFile() {
        const file = inputEl.current.files[0];
        if (!file) return;

        // Create storage reference
        const storageRef = ref(storage, "user_uploads/" + file.name);

        // Upload file
        const task = uploadBytesResumable(storageRef, file);

        // Track progress
        task.on(
            "state_changed",
            function progress(snapshot) {
                setValue((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            function error(err) {
                alert(err);
            },
            function complete() {
                alert("Uploaded to Firebase Storage successfully!");
            }
        );
    }

    return (
        <div style={{ margin: "5px 0" }}>
            <progress value={value} max="100" style={{ width: "100%" }}></progress>
            <br />
            <input
                type="file"
                onChange={uploadFile}
                ref={inputEl}
            />
        </div>
    );
};

export default UploadFile;
