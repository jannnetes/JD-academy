import { useState } from "react";
import { courses } from "../data";

const BOOKING_API_URL =
  "https://script.google.com/macros/s/AKfycbzbi9mm8TJ5WQEFhtv_sYQK-_fMIrWtgKKKobaNNHYIoo5fjCBXta7cUpIGOT5RWENt/exec";

export default function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    messenger: "",
    subject: "",
    date: "",
    time: "",
  });

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      messenger: form.messenger.trim(),
      subject: form.subject.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
    };

    if (!cleanData.name || !cleanData.phone) {
      setSuccess(false);
      setMessage("Будь ласка, заповніть ім’я та телефон.");
      return;
    }

    try {
      setSending(true);
      setMessage("");
      setSuccess(false);

      const response = await fetch(BOOKING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(cleanData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Помилка відправки");
      }

      setForm({
        name: "",
        phone: "",
        messenger: "",
        subject: "",
        date: "",
        time: "",
      });

      setSuccess(true);
      setMessage("Заявку надіслано. Ми зв’яжемося з вами найближчим часом.");
    } catch (error) {
      console.error("Booking sending error:", error);
      setSuccess(false);
      setMessage("Не вдалося надіслати заявку. Перевірте Apps Script доступ.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Ім’я
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ваше ім’я"
          required
        />
      </label>

      <label>
        Телефон (Впишіть свій номер без пропусків)
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+49..."
          required
        />
      </label>

      <label>
        Messenger
        <input
          name="messenger"
          value={form.messenger}
          onChange={handleChange}
          placeholder="Telegram / WhatsApp / Instagram"
        />
      </label>

      <label>
        Курс
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        >
          <option value="">Оберіть курс</option>

          {courses.flatMap((group) =>
            group.items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="form-grid">
        <label>
          Бажана дата
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </label>

        <label>
          Зручний час
          <input
            name="time"
            value={form.time}
            onChange={handleChange}
            placeholder="Вечір, вихідні..."
          />
        </label>
      </div>

      <button type="submit" disabled={sending}>
        {sending ? "Надсилаємо..." : "Надіслати заявку"}
      </button>

      {message && (
        <div className={success ? "form-status success" : "form-status error"}>
          <span>{success ? "✓" : "!"}</span>
          <p>{message}</p>
        </div>
      )}
    </form>
  );
}