import { useEffect, useState } from "react";
import "./App.css";

const householdMembers = ["Mami", "Bapak", "Sophea", "Sara", "Everyone"];

const startingData = {
  dates: [
    { title: "School fee due", date: "2026-05-20" },
    { title: "Dentist appointment", date: "2026-05-28" },
  ],
  chores: [
    { text: "Laundry", done: false, assignedTo: "Mami" },
    { text: "Toy reset", done: false, assignedTo: "Bapak" },
    { text: "Take out trash", done: false, assignedTo: "Bapak" },
  ],
  todos: [
    { text: "Pay school fee", deadline: "2026-05-20", assignedTo: "Mami" },
    { text: "Buy birthday goodies", deadline: "2026-06-05", assignedTo: "Mami" },
    { text: "Prepare extra clothes", deadline: "", assignedTo: "Bapak" },
  ],
  groceries: ["Eggs", "Milk", "Chicken", "Rice", "Bread"],
  meals: ["Lunch: Chicken soup", "Dinner: Fried rice"],
  kids: ["Practised writing name", "Asked why the moon changes shape"],
  wins: ["Survived a no-screen evening", "Made a family plan"],
  notes: ["things to pack"],
};

const recipeIdeas = [
  {
    name: "Nasi Goreng",
    ingredients: ["rice", "egg"],
    optional: ["chicken", "carrot", "onion"],
  },
  {
    name: "Sup Ayam",
    ingredients: ["chicken"],
    optional: ["carrot", "potato", "onion"],
  },
  {
    name: "Spaghetti Carbonara",
    ingredients: ["pasta", "minced chicken", "milk", "butter", "cheese"],
    optional: ["sausage", "sugar"],
  },
  {
    name: "Egg sandwich",
    ingredients: ["egg", "bread"],
    optional: ["cheese", "mayo"],
  },
  {
    name: "Chicken porridge",
    ingredients: ["rice", "chicken"],
    optional: ["ginger", "carrot"],
  },
];

function getDaysDifference(dateString) {
  if (!dateString) return null;

  const today = new Date();
  const targetDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
}

function getDateCountdown(dateString) {
  const days = getDaysDifference(dateString);

  if (days === null) return "No date";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `in ${days} days`;
  if (days === -1) return "Yesterday";

  return `${Math.abs(days)} days ago`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function findMeal(meals, mealType) {
  const foundMeal = meals.find((meal) =>
    meal.toLowerCase().startsWith(mealType.toLowerCase())
  );

  if (!foundMeal) return "Not planned yet";

  return foundMeal.replace(`${mealType}:`, "").trim();
}

function getMealSuggestions(groceries) {
  const pantry = groceries.map((item) => item.toLowerCase());

  return recipeIdeas
    .map((recipe) => {
      const matchedRequired = recipe.ingredients.filter((ingredient) =>
        pantry.some((item) => item.includes(ingredient.toLowerCase()))
      );

      const matchedOptional = recipe.optional.filter((ingredient) =>
        pantry.some((item) => item.includes(ingredient.toLowerCase()))
      );

      return {
        ...recipe,
        canCook: matchedRequired.length === recipe.ingredients.length,
        matchedRequired,
        matchedOptional,
        score: matchedRequired.length + matchedOptional.length,
      };
    })
    .filter((recipe) => recipe.canCook)
    .sort((a, b) => b.score - a.score);
}

export default function App() {
  const greeting = getGreeting();
  const [activeTab, setActiveTab] = useState("home");

  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem("sna-hq-display-name") || "Mami";
  });

  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("sna-hq-data");

    if (!savedData) return startingData;

    const parsedData = JSON.parse(savedData);

    return {
      ...startingData,
      ...parsedData,

      dates: Array.isArray(parsedData.dates)
        ? parsedData.dates.map((dateItem) =>
            typeof dateItem === "string"
              ? { title: dateItem, date: "" }
              : dateItem
          )
        : startingData.dates,

      chores: Array.isArray(parsedData.chores)
        ? parsedData.chores.map((chore) =>
            typeof chore === "string"
              ? { text: chore, done: false, assignedTo: "Everyone" }
              : { assignedTo: "Everyone", ...chore }
          )
        : startingData.chores,

      todos: Array.isArray(parsedData.todos)
        ? parsedData.todos.map((todo) =>
            typeof todo === "string"
              ? { text: todo, deadline: "", assignedTo: "Everyone" }
              : { assignedTo: "Everyone", ...todo }
          )
        : startingData.todos,

      groceries: Array.isArray(parsedData.groceries)
        ? parsedData.groceries
        : startingData.groceries,

      meals: Array.isArray(parsedData.meals)
        ? parsedData.meals
        : startingData.meals,

      kids: Array.isArray(parsedData.kids)
        ? parsedData.kids
        : startingData.kids,

      wins: Array.isArray(parsedData.wins)
        ? parsedData.wins
        : startingData.wins,

      notes: Array.isArray(parsedData.notes)
        ? parsedData.notes
        : startingData.notes,
    };
  });

  const [newItem, setNewItem] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newAssignee, setNewAssignee] = useState("Mami");

  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editAssignee, setEditAssignee] = useState("Mami");

  const [poofMessage, setPoofMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("sna-hq-data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("sna-hq-display-name", displayName);
  }, [displayName]);

  const unfinishedChores = data.chores.filter((chore) => !chore.done);

  const sortedDates = [...data.dates].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  const sortedTodos = [...data.todos].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const nextDate = sortedDates[0];
  const lunch = findMeal(data.meals, "Lunch");
  const dinner = findMeal(data.meals, "Dinner");
  const mealSuggestions = getMealSuggestions(data.groceries);

  const bottomTabs = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "nextup", label: "Next", icon: "📅" },
    { key: "todos", label: "To-do", icon: "⭐" },
    { key: "chores", label: "Chores", icon: "✅" },
    { key: "groceries", label: "Food", icon: "🛒" },
    { key: "kids", label: "Kids", icon: "🧸" },
  ];

  const pageInfo = {
    nextup: {
      title: "Next Up",
      subtitle: "Upcoming dates and countdowns.",
      placeholder: "Add event, e.g. School concert",
      icon: "📅",
    },
    todos: {
      title: "Important To-Do",
      subtitle: "Tasks with deadlines and assigned people.",
      placeholder: "Add important task",
      icon: "⭐",
    },
    chores: {
      title: "Chores",
      subtitle: "Tap the empty box when done. Poof.",
      placeholder: "Add chore",
      icon: "✅",
    },
    groceries: {
      title: "Groceries",
      subtitle: "Add what you have at home.",
      placeholder: "Add grocery",
      icon: "🛒",
    },
    meals: {
      title: "Meal Planner",
      subtitle: "Plan meals or use grocery suggestions.",
      placeholder: "Add meal, e.g. Lunch: Nasi goreng",
      icon: "🍱",
    },
    kids: {
      title: "Kids Notes",
      subtitle: "School stuff, tiny human admin, funny questions.",
      placeholder: "Add kids note",
      icon: "🧸",
    },
    wins: {
      title: "Wins",
      subtitle: "Small victories and family memories.",
      placeholder: "Add win",
      icon: "🏆",
    },
  };

  function changeDisplayName() {
    const newName = window.prompt("What should SnA HQ call you?", displayName);

    if (newName && newName.trim()) {
      setDisplayName(newName.trim());
    }
  }

  function openTab(tabName) {
    setNewItem("");
    setNewDate("");
    setNewAssignee("Mami");
    cancelEdit();
    setActiveTab(tabName);
  }

  function addItem() {
    if (!newItem.trim() || activeTab === "home") return;

    if (activeTab === "nextup") {
      setData({
        ...data,
        dates: [...data.dates, { title: newItem, date: newDate }],
      });

      setNewItem("");
      setNewDate("");
      return;
    }

    if (activeTab === "todos") {
      setData({
        ...data,
        todos: [
          ...data.todos,
          { text: newItem, deadline: newDate, assignedTo: newAssignee },
        ],
      });

      setNewItem("");
      setNewDate("");
      return;
    }

    if (activeTab === "chores") {
      setData({
        ...data,
        chores: [
          ...data.chores,
          { text: newItem, done: false, assignedTo: newAssignee },
        ],
      });

      setNewItem("");
      return;
    }

    setData({
      ...data,
      [activeTab]: [...data[activeTab], newItem],
    });

    setNewItem("");
  }

  function completeChore(indexToComplete) {
    const choreToComplete = unfinishedChores[indexToComplete];

    setPoofMessage("✨ Poof! Domestic victory unlocked.");

    setTimeout(() => {
      setData((currentData) => ({
        ...currentData,
        chores: currentData.chores.map((chore) =>
          chore === choreToComplete ? { ...chore, done: true } : chore
        ),
      }));

      setTimeout(() => setPoofMessage(""), 1200);
    }, 350);
  }

  function deleteItem(tab, indexToDelete) {
    if (tab === "chores") {
      const choreToDelete = unfinishedChores[indexToDelete];

      setData({
        ...data,
        chores: data.chores.filter((chore) => chore !== choreToDelete),
      });

      return;
    }

    if (tab === "nextup") {
      const dateToDelete = sortedDates[indexToDelete];

      setData({
        ...data,
        dates: data.dates.filter((dateItem) => dateItem !== dateToDelete),
      });

      return;
    }

    if (tab === "todos") {
      const todoToDelete = sortedTodos[indexToDelete];

      setData({
        ...data,
        todos: data.todos.filter((todo) => todo !== todoToDelete),
      });

      return;
    }

    setData({
      ...data,
      [tab]: data[tab].filter((_, index) => index !== indexToDelete),
    });
  }

  function startEdit(tab, index, item) {
    setEditing({ tab, index });

    if (tab === "nextup") {
      setEditValue(item.title);
      setEditDate(item.date || "");
      setEditAssignee("Mami");
      return;
    }

    if (tab === "todos") {
      setEditValue(item.text);
      setEditDate(item.deadline || "");
      setEditAssignee(item.assignedTo || "Everyone");
      return;
    }

    if (tab === "chores") {
      setEditValue(item.text);
      setEditDate("");
      setEditAssignee(item.assignedTo || "Everyone");
      return;
    }

    setEditValue(item);
    setEditDate("");
    setEditAssignee("Mami");
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
    setEditDate("");
    setEditAssignee("Mami");
  }

  function saveEdit() {
    if (!editing || !editValue.trim()) return;

    const { tab, index } = editing;

    if (tab === "nextup") {
      const dateToEdit = sortedDates[index];

      setData({
        ...data,
        dates: data.dates.map((dateItem) =>
          dateItem === dateToEdit
            ? { ...dateItem, title: editValue, date: editDate }
            : dateItem
        ),
      });

      cancelEdit();
      return;
    }

    if (tab === "todos") {
      const todoToEdit = sortedTodos[index];

      setData({
        ...data,
        todos: data.todos.map((todo) =>
          todo === todoToEdit
            ? {
                ...todo,
                text: editValue,
                deadline: editDate,
                assignedTo: editAssignee,
              }
            : todo
        ),
      });

      cancelEdit();
      return;
    }

    if (tab === "chores") {
      const choreToEdit = unfinishedChores[index];

      setData({
        ...data,
        chores: data.chores.map((chore) =>
          chore === choreToEdit
            ? { ...chore, text: editValue, assignedTo: editAssignee }
            : chore
        ),
      });

      cancelEdit();
      return;
    }

    setData({
      ...data,
      [tab]: data[tab].map((item, itemIndex) =>
        itemIndex === index ? editValue : item
      ),
    });

    cancelEdit();
  }

  function addSuggestionToMeals(recipeName) {
    setData({
      ...data,
      meals: [...data.meals, `Dinner: ${recipeName}`],
    });
  }

  function getCurrentItems() {
    if (activeTab === "chores") return unfinishedChores;
    if (activeTab === "nextup") return sortedDates;
    if (activeTab === "todos") return sortedTodos;
    return data[activeTab] || [];
  }

  function getDisplayText(item) {
    if (activeTab === "chores") {
      return `${item.text} • ${item.assignedTo || "Everyone"}`;
    }

    if (activeTab === "todos") {
      return `${item.text} • ${item.assignedTo || "Everyone"} • ${
        item.deadline
          ? `${item.deadline} • ${getDateCountdown(item.deadline)}`
          : "No deadline"
      }`;
    }

    if (activeTab === "nextup") {
      return `${item.title}${
        item.date
          ? ` • ${item.date} • ${getDateCountdown(item.date)}`
          : " • No date"
      }`;
    }

    return item;
  }

  const currentPage = pageInfo[activeTab];
  const currentItems = getCurrentItems();

  return (
    <div className="screen">
      <div className="phone">
        <header className="top-header">
          <div className="brand-copy">
            <p className="greeting">
              {greeting}, {displayName}! 👋
            </p>

            <div className="brand-row">
              <h1>SnA HQ</h1>
              <span className="brand-star">✨</span>
            </div>

            <p className="subtitle">Your family dashboard</p>

            <div className="mini-stickers">
              <span>☁️</span>
              <span>🌸</span>
              <span>🧸</span>
            </div>
          </div>

          <button className="profile" onClick={changeDisplayName}>
            {displayName.charAt(0).toUpperCase()}
          </button>
        </header>

        {activeTab === "home" ? (
          <main className="dashboard">
            <section className="main-cards">
              <button
                className="feature-card important-card"
                onClick={() => openTab("todos")}
              >
                <div className="round-icon">⭐</div>
                <p>Important</p>
                <span>Top deadlines</span>

                <ul className="todo-preview">
                  {sortedTodos.slice(0, 3).map((todo, index) => (
                    <li key={index}>
                      {todo.text}
                      <small>
                        {todo.assignedTo} •{" "}
                        {todo.deadline
                          ? getDateCountdown(todo.deadline)
                          : "No deadline"}
                      </small>
                    </li>
                  ))}
                </ul>

                <div className="card-button">View Tasks ›</div>
              </button>

              <button
                className="feature-card chores-preview-card"
                onClick={() => openTab("chores")}
              >
                <div className="round-icon">🧺</div>
                <p>Chores</p>
                <span>Today’s list</span>

                <ul className="chore-preview">
                  {unfinishedChores.slice(0, 3).map((chore, index) => (
                    <li key={index}>
                      <span className="tiny-box" />
                      {chore.text}
                      <small>{chore.assignedTo}</small>
                    </li>
                  ))}
                </ul>

                <div className="card-button coral">View Chores ›</div>
              </button>
            </section>

            <section className="next-card" onClick={() => openTab("nextup")}>
              <div className="home-icon">📅</div>
              <div>
                <h2>Next Up</h2>
                <p>{nextDate?.title || "Nothing added yet"}</p>
                <p>
                  {nextDate?.date
                    ? getDateCountdown(nextDate.date)
                    : "Add your first date"}
                </p>
              </div>
              <div className="family-doodle">⏰</div>
            </section>

            <section className="meal-card-wide" onClick={() => openTab("meals")}>
              <div className="home-icon">🍱</div>
              <div>
                <h2>Meal Planner</h2>
                <p>Lunch: {lunch}</p>
                <p>Dinner: {dinner}</p>
              </div>
              <div className="family-doodle">🍽️</div>
            </section>

            <section className="dashboard-notes">
              <div className="notes-header">
                <div>
                  <h2>Little Notes</h2>
                  <p>Put your thoughts here</p>
                </div>
                <span>📝</span>
              </div>

              <div className="note-bubbles">
                {(data.notes || []).slice(0, 3).map((note, index) => (
                  <div className="note-bubble" key={index}>
                    <span>🌷</span>
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        ) : (
          <main className="page">
            <section className="page-title">
              <div className="page-icon">{currentPage.icon}</div>
              <div>
                <h2>{currentPage.title}</h2>
                <p>{currentPage.subtitle}</p>
              </div>
            </section>

            <section
              className={
                activeTab === "nextup" ||
                activeTab === "todos" ||
                activeTab === "chores"
                  ? "add-box smart-add-box"
                  : "add-box"
              }
            >
              <input
                value={newItem}
                onChange={(event) => setNewItem(event.target.value)}
                placeholder={currentPage.placeholder}
              />

              {(activeTab === "nextup" || activeTab === "todos") && (
                <label className="date-field">
                  <span>{activeTab === "todos" ? "Deadline?" : "When?"}</span>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                  />
                </label>
              )}

              {(activeTab === "todos" || activeTab === "chores") && (
                <label className="assignee-field">
                  <span>Who?</span>
                  <select
                    value={newAssignee}
                    onChange={(event) => setNewAssignee(event.target.value)}
                  >
                    {householdMembers.map((member) => (
                      <option key={member}>{member}</option>
                    ))}
                  </select>
                </label>
              )}

              <button onClick={addItem}>+</button>
            </section>

            {poofMessage && <div className="poof-message">{poofMessage}</div>}

            {activeTab === "meals" && (
              <section className="suggestion-box">
                <h3>What can we cook?</h3>
                <p>Based on groceries you added at home.</p>

                {mealSuggestions.length === 0 ? (
                  <div className="empty-suggestion">
                    Add more groceries first. Try rice, eggs, chicken, bread or
                    milk.
                  </div>
                ) : (
                  <div className="suggestion-list">
                    {mealSuggestions.slice(0, 4).map((recipe) => (
                      <div className="suggestion-card" key={recipe.name}>
                        <div>
                          <strong>{recipe.name}</strong>
                          <span>
                            You have:{" "}
                            {[
                              ...recipe.matchedRequired,
                              ...recipe.matchedOptional,
                            ].join(", ")}
                          </span>
                        </div>

                        <button onClick={() => addSuggestionToMeals(recipe.name)}>
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="list">
              {currentItems.map((item, index) => {
                const isEditing =
                  editing?.tab === activeTab && editing?.index === index;

                return (
                  <div className="list-item" key={index}>
                    {isEditing ? (
                      <div className="edit-row">
                        <input
                          value={editValue}
                          onChange={(event) => setEditValue(event.target.value)}
                          autoFocus
                        />

                        {(activeTab === "nextup" || activeTab === "todos") && (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(event) => setEditDate(event.target.value)}
                          />
                        )}

                        {(activeTab === "todos" || activeTab === "chores") && (
                          <select
                            value={editAssignee}
                            onChange={(event) =>
                              setEditAssignee(event.target.value)
                            }
                          >
                            {householdMembers.map((member) => (
                              <option key={member}>{member}</option>
                            ))}
                          </select>
                        )}

                        <div className="edit-actions">
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="list-main">
                          {activeTab === "chores" ? (
                            <button
                              className="empty-check"
                              onClick={() => completeChore(index)}
                            >
                              ✓
                            </button>
                          ) : (
                            <span className="list-icon">{currentPage.icon}</span>
                          )}

                          <p>{getDisplayText(item)}</p>
                        </div>

                        <div className="item-actions">
                          <button
                            onClick={() => startEdit(activeTab, index, item)}
                          >
                            ✎
                          </button>
                          <button onClick={() => deleteItem(activeTab, index)}>
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </section>
          </main>
        )}

        <nav className="bottom-nav">
          {bottomTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => openTab(tab.key)}
              className={activeTab === tab.key ? "active" : ""}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}