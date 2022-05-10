import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function fetchDataContentFrom(page) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reload = async () => {
        setLoading(true);
        try {
            let db = getFirestore();
            let document = doc(db, "dataContent", page);
            let snapshot = await getDoc(document);
            setData(snapshot.data());
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(async () => {
        setLoading(true);
        try {
            let db = getFirestore();
            let document = doc(db, "dataContent", page);
            let snapshot = await getDoc(document);
            setData(snapshot.data());
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);
    return [data, loading, error, reload];
}
