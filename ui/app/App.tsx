import { Page } from "@dynatrace/strato-components-preview/layouts";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { About } from "./pages/About";
import { Architecture } from "./pages/Architecture";
import { Data } from "./pages/Data";
import { GlobalStyles } from "./components/GlobalStyles";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";

export const App = () => {
  return (
    <Page>
      <GlobalStyles />
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/data" element={<Data />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
