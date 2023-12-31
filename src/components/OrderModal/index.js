import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Field } from "react-final-form";
import DatePicker, { registerLocale } from "react-datepicker";
import { setMinutes, setHours, format } from "date-fns";
import ru from "date-fns/locale/ru";
import InputMask from "react-input-mask";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import { addTable } from "../../store/user/userSlice";

import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

function OrderModal({ closeModal }) {
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [startDate, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), 9),
  );

  registerLocale("ru", ru);
  const allTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };

  const required = (value) => (value ? undefined : "Обязательное поле");
  const mustBeNumber = (value) => (Number.isNaN(value) ? "Это должно быть число" : undefined);
  const minValue = (min) => (value) => (Number.isNaN(value) || value >= min ? undefined : `Должно быть больше ${min}`);
  const minLength = (value) => (value.length >= 6 ? undefined : "Должно быть больше 6 символов");
  const validatePhoneNumber = (value) => {
    const phoneNumberPattern = /^(\+380\s?)?(\d{2,3}\s?)?\d{3}\s?\d{2}\s?\d{2}$/;
    if (!value) {
      return "Обязательное поле";
    } if (!phoneNumberPattern.test(value.replace(/\s/g, ""))) {
      return "Некорректный формат телефона";
    }
    return undefined;
  };
  const composeValidators = (...validators) => (
    (value) => validators.reduce((error, validator) => error || validator(value), undefined)
  );

  const onSubmit = (e) => {
    const email = localStorage.getItem("email");
    const formattedDateTime = format(e.data, "MM/dd/yy HH:mm");

    if (email === null) {
      setShowConfirmModal(true);
    } else {
      dispatch(addTable(
        {
          ...e,
          data: formattedDateTime,
        },
      ));
    }
  };

  return (

    <>
      {showConfirmModal
                && (
                <ConfirmModal onClick={closeConfirmModal}>
                  Для того чтобы забронировать столик вам нужно
                  {" "}
                  <Link to="login-page">войти</Link>
                  {" "}
                  в аккаунт
                </ConfirmModal>
                )}

      <div className="order-modal">
        <div className="detail-info">
          <img src="/img/other/logo.png" alt="logo" />
          <button type="button" onClick={closeModal} className="close-modal">
            <img src="/img/other/closer.png" alt="closer" />
          </button>
          <h3>ЗАБРОНИРОВАТЬ СТОЛИК</h3>
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="form-adding">

                <Field name="username" validate={required}>
                  {({ input, meta }) => (
                    <div className={`form-field-wrapper  ${meta.error && meta.touched ? "error" : ""}`}>
                      <input {...input} type="text" placeholder="Имя" className="form-field" autoComplete="off" />
                      {meta.error && meta.touched && <span>{meta.error}</span>}
                    </div>
                  )}
                </Field>

                <Field name="phoneNumber" validate={composeValidators(required, minLength, validatePhoneNumber)}>
                  {({ input, meta }) => (
                    <div className={`form-field-wrapper  ${meta.error && meta.touched ? "error" : ""}`}>
                      <InputMask
                        {...input}
                        mask="+380 99 999 99 99"
                        maskChar="_"
                        placeholder="Телефон"
                        className="form-field"
                        alwaysShowMask
                      />
                      {meta.error && meta.touched && <span>{meta.error}</span>}
                    </div>
                  )}
                </Field>

                <Field name="table" component="select" validate={required}>
                  {({ input, meta }) => (
                    <div className={`form-field-wrapper  ${meta.error && meta.touched ? "error" : ""}`}>
                      <select {...input} name="table" className="form-field">
                        <option value="" disabled defaultValue>Столик</option>
                        {allTables.map((num, index) => (
                          <option value={num} key={index}>{num}</option>
                        ))}
                      </select>
                      {meta.error && meta.touched && <span>{meta.error}</span>}
                    </div>
                  )}
                </Field>

                <Field
                  name="guests"
                  component="input"
                  validate={composeValidators(required, minValue(1), mustBeNumber)}
                >
                  {({ input, meta }) => (
                    <div className={`form-field-wrapper  ${meta.error && meta.touched ? "error" : ""}`}>
                      <input
                        {...input}
                        type="text"
                        placeholder="Количество гостей"
                        className="form-field"
                        autoComplete="off"
                      />
                      {meta.error && meta.touched && <span>{meta.error}</span>}
                    </div>
                  )}
                </Field>

                <Field name="data" validate={required}>
                  {({ input, meta }) => (
                    <div className={`form-field-wrapper  ${meta.error && meta.touched ? "error" : ""}`}>
                      <div style={{ position: "relative", width: "100%" }}>
                        <DatePicker
                          autoComplete="off"
                          placeholderText="Дата/Время"
                          name="data"
                          locale={ru}
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          showTimeSelect
                          filterTime={filterPassedTime}
                          dateFormat="dd/MM/yy HH:mm"
                          isClearable
                          {...input}
                          className="form-field"
                        />
                        {meta.error && meta.touched && <span>{meta.error}</span>}
                      </div>
                    </div>
                  )}
                </Field>

                <Button title="Забронировать" className="order-link" type="submit" />
              </form>
            )}
          />

        </div>
      </div>
    </>

  );
}

OrderModal.propTypes = {
  closeModal: PropTypes.func,
};

export default OrderModal;
