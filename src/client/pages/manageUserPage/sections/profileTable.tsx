import { Table } from "blaise-design-system-react-components";
import { Link } from "react-router-dom";

import { type GetUserResponse } from "../../../types/usersApi.types";

import type { User } from "blaise-api-node-client";

export default function ProfileTable({
  currentUser,
  viewedUserDetails,
}: {
  currentUser: User;
  viewedUserDetails: GetUserResponse;
}) {
  const {
    name = "",
    role = "",
    defaultServerPark = "",
    serverParks = [],
  } = viewedUserDetails?.data ?? {};
  const { name: currentUsername } = currentUser;
  const roleName = typeof role === "string" ? role : (role?.name ?? "");

  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-m"
    >
      <h1 className="ons-u-mb-l">{name ? name : "Not found"}</h1>
      <Table
        id="user-details-table"
        columns={["Field", "Value"]}
        scrollableLabel="User details"
      >
        <tr className="ons-table__row">
          <td className="ons-table__cell">Role</td>
          <td className="ons-table__cell">{roleName ? roleName : "Not found"}</td>
        </tr>
        <tr className="ons-table__row">
          <td className="ons-table__cell">Default server park</td>
          <td className="ons-table__cell">{defaultServerPark ? defaultServerPark : "Not found"}</td>
        </tr>
        <tr className="ons-table__row">
          <td className="ons-table__cell">Server parks</td>
          <td className="ons-table__cell">
            {serverParks.length > 0 ? serverParks.join(", ") : "Not found"}
          </td>
        </tr>
      </Table>
      <h2 className="ons-u-mb-s">Actions</h2>
      <ul className="ons-list ons-list--bare">
        <li className="ons-list__item ons-u-mb-xs">
          {name === currentUsername ? (
            "Current user"
          ) : (
            <Link
              to={"/users/change-password/" + name}
              state={{ currentUser, viewedUserDetails }}
              className="ons-summary__button"
            >
              Change password
            </Link>
          )}
        </li>
        <li className="ons-list__item ons-u-mb-xs">
          <Link
            to={"/users/change-role/" + name}
            state={{ currentUser, viewedUserDetails }}
            className="ons-summary__button"
          >
            Change role
          </Link>
        </li>
        <li className="ons-list__item">
          {name === currentUsername ? (
            "Cannot delete current user"
          ) : (
            <Link
              to={"/users/delete/" + name}
              className="ons-summary__button"
            >
              Delete
            </Link>
          )}
        </li>
      </ul>
    </main>
  );
}
