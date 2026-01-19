import { useLocation, useNavigate, useSearchParams } from "react-router";

export function useNavigateFrom () : [
    (path: string) => void,
    () => string | undefined
] {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParms, _setSearchParms] = useSearchParams()

    const navigateFrom = (path: string) => {
        let from = location.pathname
        if (searchParms.size) {
            from += `?${searchParms.toString()}`
        }
        from = btoa(from)
        const newURL = `${path}?from=${from}`
        navigate(newURL)
    }

    const getNavigateFrom = (): string | undefined => {
        const fromValue = searchParms.get("from")
        if (fromValue) {
            return atob(fromValue)
        }
        return undefined
    }
    
    return [navigateFrom, getNavigateFrom]
}