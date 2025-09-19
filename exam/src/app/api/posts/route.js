export async function GET(request) {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");

    

    const posts = await res.json();

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
 
}