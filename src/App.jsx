import { useState } from "react";
import trailerIcon from "./assets/trailer-icon.svg";
import closeIcon from "./assets/close-icon.svg";
import createIcon from "./assets/create-icon.svg";
import checkmarkIcon from "./assets/checkmark-icon.svg";
import fontAwesomeEditIcon from "./assets/font-awesome-edit-icon.svg";
import deleteIcon from "./assets/delete-icon.svg";
import "./App.css";

class Trailer {
  id;
  height_feet;
  height_inches;
  service_date;
  mot_date;

  constructor(id, height_feet, height_inches, service_date, mot_date) {
    this.id = id;
    this.height_feet = height_feet;
    this.height_inches = height_inches;
    this.service_date = service_date;
    this.mot_date = mot_date;
  }
}

/*
4221027
13' 10"
2026-03-31
2027-02-03
*/

const STORAGE_KEY = "test-app";

export default function App() {
  const [trailers, set_trailers] = useState(getStoredTrailers());

  const [editing, set_editing] = useState(false);
  const [refreshing, set_refreshing] = useState(false);

  function handleFormSubmit(formData) {
    if (editing) {
      console.log("Update Trailer button pressed");
    } else {
      console.log("Add New Trailer button pressed");
    }
    const id = formData.get("trailer-id");
    const height_feet = Number(formData.get("height-feet"));
    const height_inches = Number(formData.get("height-inches"));
    const service_date = Date(formData.get("service-date"));
    const mot_date = Date(formData.get("mot-date"));

    const trailer = new Trailer(
      id,
      height_feet,
      height_inches,
      service_date,
      mot_date,
    );

    console.log(trailer);

    if (editing) {
      console.log("Updating trailer");
      const stored_trailers = getStoredTrailers();
      const idx = stored_trailers.findIndex((t) => t.id === trailer.id);
      if (idx === -1) {
        window.alert("Cannot edit a trailers number");
        return;
      }
      stored_trailers.splice(idx, 1, trailer);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored_trailers));
      set_trailers(stored_trailers);
      set_editing(false);
      return;
    }

    if (trailerAlreadyExists(trailer)) {
      window.alert("Trailer already exists. Switching to edit");
      handleEdit(trailer);
      return;
    }

    console.log("Storing new trailer");
    storeNewTrailer(trailer);
  }

  function trailerAlreadyExists(trailer) {
    const stored_trailers = getStoredTrailers();
    const found = stored_trailers.find((t) => t.id === trailer.id);
    return found === undefined ? false : true;
  }

  function getStoredTrailers() {
    const data = window.localStorage.getItem(STORAGE_KEY);
    const stored_trailers = data ? JSON.parse(data) : [];
    return stored_trailers;
  }

  function storeNewTrailer(trailer) {
    const stored_trailers = getStoredTrailers();
    stored_trailers.push(trailer);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored_trailers));
    set_trailers(stored_trailers);
  }

  function handleCancelEdit() {
    console.log("Cancel Edit button pressed");
    set_editing(false);
    const form = document.getElementById("form");
    form.reset();
  }

  function handleEdit(trailer) {
    console.log("Edit Trailer button pressed");
    set_editing(true);

    const trailer_id_input = document.getElementById("trailer-id");
    trailer_id_input.value = trailer.id;

    const height_feet_input = document.getElementById("height-feet");
    height_feet_input.value = trailer.height_feet;

    const height_inches_input = document.getElementById("height-inches");
    height_inches_input.value = trailer.height_inches;

    const service_date_input = document.getElementById("service-date");
    service_date_input.value = dateToString(new Date(trailer.service_date));

    const mot_date_input = document.getElementById("mot-date");
    mot_date_input.value = dateToString(new Date(trailer.mot_date));
  }

  function dateToString(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const string = `${year}-${month > 9 ? month : `0${month}`}-${day > 9 ? day : `0${day}`}`;
    return string;
  }

  function handleDelete(trailer) {
    console.log("Delete Trailer button pressed");
    const stored_trailers = getStoredTrailers();
    const idx = stored_trailers.findIndex((t) => t.id === trailer.id);
    stored_trailers.splice(idx, 1);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored_trailers));
    set_trailers(stored_trailers);
  }

  return (
    <>
      <div className="page">
        <div className="header">
          <img src={trailerIcon} width={64} height={48} />
          <p className="title">Trailer Management</p>
        </div>

        <form id="form" action={handleFormSubmit} className="form">
          <div className="form-header">
            <p className="section-title">Add New Trailer</p>
            <button
              type="button"
              onClick={handleCancelEdit}
              hidden={!editing}
              className="cancel-edit-button"
            >
              <img src={closeIcon} />
            </button>
          </div>

          <div className="input-group">
            <p className="input-label">Trailer Number</p>
            <input
              type="text"
              id="trailer-id"
              name="trailer-id"
              className="input"
            />
          </div>

          <div className="input-group">
            <p className="input-label">Height</p>
            <div className="measurement-row">
              <div className="measurement-input">
                <input
                  type="tel"
                  id="height-feet"
                  name="height-feet"
                  className="input"
                />
                <p className="measurement-unit">ft</p>
              </div>
              <div className="measurement-input">
                <input
                  type="tel"
                  id="height-inches"
                  name="height-inches"
                  className="input"
                />
                <p className="measurement-unit">in</p>
              </div>
            </div>
          </div>

          <div className="input-group">
            <p className="input-label">Service Date</p>
            <input
              type="date"
              id="service-date"
              name="service-date"
              className="input-date"
            />
          </div>

          <div className="input-group">
            <p className="input-label">MOT Date</p>
            <input
              type="date"
              id="mot-date"
              name="mot-date"
              className="input-date"
            />
          </div>

          <button type="submit" className="submit-button">
            {editing ? <img src={checkmarkIcon} /> : <img src={createIcon} />}
            {editing ? "Update Trailer" : "Add New Trailer"}
          </button>
        </form>

        <div className="trailer-list-container">
          <p className="section-title">Saved Trailers</p>

          {refreshing ? (
            <div>
              <p>Refreshing...</p>
            </div>
          ) : trailers.length === 0 ? (
            <div>
              <p className="empty-text">No trailers added yet</p>
            </div>
          ) : (
            trailers.map((trailer) => (
              <div key={trailer.id} className="trailer-card">
                <div className="trailer-header">
                  <div className="trailer-title-row">
                    <img src={trailerIcon} />
                    <p className="trailer-title">{trailer.id}</p>
                  </div>
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() => handleEdit(trailer)}
                      className="edit-button"
                    >
                      <img src={fontAwesomeEditIcon} width={32} height={32} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(trailer)}
                      className="delete-button"
                    >
                      <img src={deleteIcon} />
                    </button>
                  </div>
                </div>

                <div className="trailer-details">
                  <div className="detail-row">
                    <p className="detail-label">Height:</p>
                    <p className="detail-value">
                      {trailer.height_feet}' {trailer.height_inches}"
                    </p>
                  </div>

                  <div className="detail-row">
                    <p className="detail-label">Service Date:</p>
                    <p className="detail-value">
                      {new Date(trailer.service_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="detail-row">
                    <p className="detail-label">MOT Date:</p>
                    <p className="detail-value">
                      {new Date(trailer.mot_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
