import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import logo from "./photo-jersey-raw-logo.jpg";
import BackgroundImage from "./Photos/Food2.jpg";

const recipes = [
  { name: "Royal Carnivore", price: 12.99 },
  { name: "Daily Thrive", price: 4.25 },
  { name: "Growing Paws Puppy", price: 2.99 },
  { name: "Puppy Thrive", price: 4.99 },
  { name: "Joint Care Blend", price: 5.25 },
  { name: "Alpha Bite Beef", price: 6.0 },
  { name: "Wild Balance", price: 7.99 },
  { name: "Fetch and Feast Chicken", price: 2.25 },
  { name: "Wild Whiskers", price: 5.25 },
];

export default function OrderForm() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    recipe: "",
    container: "1 lb tub",
    amount: "",
    notes: "",
    coupon: "",  // coupon field
  });

  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [warning, setWarning] = useState("");
  const TAX_RATE = 0.06625;

  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
    fontSize: "1em",
    outline: "none",
  };

  const buttonStyle = {
    padding: "14px",
    backgroundColor: "#2b6e44",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipeParam = params.get("recipe");
    const amountParam = params.get("weight");
    if (recipeParam) setFormData((prev) => ({ ...prev, recipe: recipeParam }));
    if (amountParam)
      setFormData((prev) => ({ ...prev, amount: Math.floor(Number(amountParam)) }));
  }, [location.search]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "amount") {
      value = value.replace(/\D/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const selectedRecipe = recipes.find((r) => r.name === formData.recipe);
    const pricePerLb = selectedRecipe ? selectedRecipe.price : 0;
    const lbs = parseInt(formData.amount) || 0;

    if (lbs > 0) {
      if (formData.container === "2 lb meat chubs" && lbs % 2 !== 0) {
        setWarning("Amount must be divisible by 2 for 2 lb meat chubs.");
      } else if (
        (formData.container === "1 lb tub" || formData.container === "2 oz tub (Cat Food)") &&
        !Number.isInteger(lbs)
      ) {
        setWarning("Amount must be a whole number.");
      } else {
        setWarning("");
      }
    } else {
      setWarning("");
    }

    const subtotal = pricePerLb * lbs;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    setTotals({ subtotal, tax, total });
  }, [formData.amount, formData.recipe, formData.container]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (warning) return;

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      recipe: formData.recipe,
      container: formData.container,
      amount: formData.amount,
      coupon: formData.coupon,  // send coupon to sheet
      total: totals.total.toFixed(2),
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzkOj4kkDHK4niZeJ4TEGtZ5lTGtec6Yrt64y-XQbfWGmnKN_71zyY4NeTIoIvCQVRL/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        alert("Order submitted successfully!");
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          recipe: "",
          container: "1 lb tub",
          amount: "",
          notes: "",
          coupon: "",  // reset coupon
        });
      } else {
        alert("Submission failed: " + data.message);
      }
    } catch (error) {
      alert("Submission failed: " + error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.25)",
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "520px",
          width: "100%",
          padding: "25px 30px",
          background: "rgba(255,255,255,0.9)",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            display: "block",
            margin: "0 auto 20px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            opacity: 0.95,
          }}
        />

        <h2
          style={{
            textAlign: "center",
            color: "#2b6e44",
            marginBottom: "25px",
          }}
        >
          Place Your Order
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <select
            name="recipe"
            value={formData.recipe}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">-- Select Recipe --</option>
            {recipes.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} – ${r.price.toFixed(2)}/lb
              </option>
            ))}
          </select>

          <select
            name="container"
            value={formData.container}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="1 lb tub">1 lb Tub</option>
            <option value="2 lb meat chubs">2 lb Meat Chubs</option>
            <option value="2 oz tub (Cat Food)">2 oz Tub (Cat Food)</option>
          </select>

          <input
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="Amount"
            style={inputStyle}
          />

          <textarea
            name="notes"
            placeholder="Questions or Allergies (optional)"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          {/* Coupon field */}
          <input
            type="text"
            name="coupon"
            placeholder="Coupon Code (optional)"
            value={formData.coupon}
            onChange={handleChange}
            style={inputStyle}
          />

          <div
            style={{
              backgroundColor: "#f3f7f5",
              borderRadius: "10px",
              padding: "15px",
              fontSize: "1em",
              color: "#2b6e44",
              lineHeight: 1.6,
            }}
          >
            <strong>Order Summary</strong>
            <br />
            Subtotal: ${totals.subtotal.toFixed(2)}
            <br />
            NJ Sales Tax (6.625%): ${totals.tax.toFixed(2)}
            <br />
            <strong>Total: ${totals.total.toFixed(2)}</strong>
          </div>

          <button
            type="submit"
            disabled={!!warning}
            style={{
              ...buttonStyle,
              opacity: warning ? 0.6 : 1,
              cursor: warning ? "not-allowed" : "pointer",
            }}
          >
            Submit Order
          </button>
        </form>
      </div>
    </div>
  );
}
