import React, { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecipe(data.recipe);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>AI Recipe Finder</h1>

      <textarea
        placeholder="Quick dinner, no dairy, 3 people, under 30 minutes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={generate} disabled={loading || !text}>
        {loading ? "Thinking..." : "Generate"}
      </button>

      {error && <div className="error">Error: {error}</div>}

      {recipe && (
        <div className="card">
          <h2>{recipe.name}</h2>
          <p>{recipe.description}</p>

          <h3>Ingredients</h3>
          <ul>{recipe.ingredients.map((i, idx) => (<li key={idx}>{i}</li>))}</ul>

          <h3>Steps</h3>
          <ol>{recipe.steps.map((s, idx) => (<li key={idx}>{s}</li>))}</ol>
        </div>
      )}
    </div>
  );
}
