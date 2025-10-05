async function loadArray(arrayURL) {
    try {
        const response = await fetch(arrayURL)

        let currentArray

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }
        currentArray = await response.json()

        console.log(`${arrayURL} data load succefully: `, currentArray)

        return currentArray
    }
    catch (error) {
        console.error("Error loading characters", error)
        return []
    }
}

export default loadArray