
export async function testBackend(){
    const response = await fetch("http://localhost:8000");
    const data = await response.json();
    return data;
}