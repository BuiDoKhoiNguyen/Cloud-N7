import { useEffect } from "react";

export function usePagination({ fn, page = 0, limit = 10 }) {
    const [data, setData] = useState([]);
    const totalRef = useRef(0);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(page);
    const limitRef = useRef(limit);

    const fetchData = useCallback(async () => {
        try {
            const response = await fn({ page: pageRef.current, limit: limitRef.current });
            hasMoreRef.current = response.hasMore;
            pageRef.current += 1;
            setData(prev => [...prev, ...response.data]);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [fn]);

    const loadMore = useCallback(() => {
        try {
            if (hasMoreRef.current) {
                fetchData();
            }
        } catch (error) {
            console.error("Error loading more data:", error);
        }
    }, [fn]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        hasMore: hasMoreRef.current,
        loadMore,
        page: pageRef.current,
        limit: limitRef.current,
        total: totalRef.current
    };
}
