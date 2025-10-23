"use client";
import React from "react";
import {TailSpin} from 'react-loader-spinner';

  // https://www.npmjs.com/package/react-loader-spinner
  // Thanks to the above website, I figured out how to use the TailSpin spinner.
  // I was missing the packages needed to use a spinner.

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <TailSpin />
    </div>
  );
};

export default Spinner;
