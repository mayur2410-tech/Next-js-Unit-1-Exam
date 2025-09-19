export async function GET(request, {params}) {
    
    const id = parseInt(params.id) 
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

    const posts = await res.json();

           return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
 
}