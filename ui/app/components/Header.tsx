import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@dynatrace/strato-components-preview/layouts";

export const Header = () => {
  return (
    <AppHeader>
      <AppHeader.NavItems>
        <AppHeader.AppNavLink as={Link} to="/" />
        <AppHeader.NavItem as={Link} to="/">
          Footprint
        </AppHeader.NavItem>
        <AppHeader.NavItem as={Link} to="/architecture">
          Architecture
        </AppHeader.NavItem>
        <AppHeader.NavItem as={Link} to="/about">
          About
        </AppHeader.NavItem>
      </AppHeader.NavItems>
    </AppHeader>
  );
};
