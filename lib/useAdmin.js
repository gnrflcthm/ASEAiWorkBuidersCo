import { useState, useEffect } from "react";

import axios from "axios";

import "firebase.config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function useAdmin(csrfToken, sessionCookie) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(async () => {
        setLoading(true);
        try {
            let res = await axios.post(
                "/api/admin/uid",
                { sessionCookie },
                {
                    headers: {
                        "xsrf-token": csrfToken,
                    },
                }
            );

            let db = getFirestore();
            let snapshot = await getDoc(doc(db, "admin", res.data.uid));
            setAdmin({ ...snapshot.data(), id: res.data.uid });
        } catch (err) {
            console.log(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);
    return [admin, loading, error];
}
