import React from "react";
import PropTypes from "prop-types";
import "./EditValueField.css";
import { connect } from "react-redux";
import { updateValueField } from "../../../../actions/ui-actions";

import Category from "../../../../models/Category";
import TextField from "@mui/material/TextField";

const EditValueField = ({ value, category, onChange }) => {
  return (
    <TextField
      type="number"
      label={category.name}
      fullWidth
      size="small"
      className="EditValueField"
      value={value !== undefined ? value : category.value}
      onChange={(e) => onChange(category.id, parseInt(e.target.value, 10))}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
        },
        "& .MuiInputLabel-root": {
          fontSize: "14px",
        },
      }}
    />
  );
};

EditValueField.propTypes = {
  value: PropTypes.number,
  category: PropTypes.instanceOf(Category),
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    value: state.ui.values[props.category.id],
  };
};

export default connect(mapStateToProps, {
  onChange: updateValueField,
})(EditValueField);
