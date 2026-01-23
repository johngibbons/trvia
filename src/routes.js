import React, { useEffect } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Home from "./components/home/Home";
import Game from "./components/game/Game";
import Group from "./components/group/Group";
import NoMatch from "./components/noMatch/NoMatch";
import PageContainer from "./components/pageContainer/PageContainer";
import EditGame from "./components/editGame/EditGame";
import Admin from "./components/admin/Admin";
import Entry from "./components/entry/Entry";
import MasterEntry from "./components/entry/MasterEntry";
import Search from "./components/search/Search";
import UserEntries from "./components/users/userEntries/UserEntries";
import Auth from "./components/auth/Auth";
import { checkAuthStatus } from "./actions/user-actions";
import { fetchGame } from "./actions/game-actions";
import { fetchGroup } from "./actions/group-actions";
import { fetchEntry, fetchUserEntries } from "./actions/entry-actions";
import { CURRENT_GAME } from "./constants";

// Auth guard wrapper component
const RequireAuth = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUserId = useSelector((state) => state.currentUser.get("id"));

  useEffect(() => {
    if (!currentUserId) {
      dispatch(checkAuthStatus(() => {}, true, { pathname: location.pathname }));
    }
  }, [currentUserId, dispatch, location.pathname]);

  if (!currentUserId) {
    return null; // or a loading spinner
  }

  return children;
};

// Check auth wrapper for routes that should check auth but not require it
const CheckAuth = ({ children }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.currentUser.get("id"));

  useEffect(() => {
    if (!currentUserId) {
      dispatch(checkAuthStatus(() => {}, false, null));
    }
  }, [currentUserId, dispatch]);

  return children;
};

// Home wrapper with data loading
const HomeWithData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGame(CURRENT_GAME));
  }, [dispatch]);

  return <Home />;
};

// EditGame wrapper with data loading
const EditGameWithData = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      dispatch(fetchGame(id));
    }
  }, [dispatch, id]);

  return <EditGame routeParams={params} />;
};

// Game wrapper (no data loading needed based on original routes)
const GameWithParams = () => {
  const params = useParams();
  return <Game routeParams={params} />;
};

// Group wrapper with data loading
const GroupWithData = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      dispatch(fetchGroup(id));
    }
  }, [dispatch, id]);

  return <Group routeParams={params} />;
};

// Entry wrapper with data loading
const EntryWithData = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      dispatch(fetchEntry(id));
    }
  }, [dispatch, id]);

  return <Entry routeParams={params} />;
};

// UserEntries wrapper with data loading
const UserEntriesWithData = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      dispatch(fetchUserEntries(id));
    }
  }, [dispatch, id]);

  return <UserEntries routeParams={params} />;
};

// MasterEntry wrapper with data loading
const MasterEntryWithData = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      dispatch(fetchGame(id));
    }
  }, [dispatch, id]);

  return <MasterEntry routeParams={params} />;
};

// Main routes component
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <CheckAuth>
            <PageContainer />
          </CheckAuth>
        }
      >
        <Route index element={<HomeWithData />} />
        <Route
          path="games/:id/edit"
          element={
            <RequireAuth>
              <EditGameWithData />
            </RequireAuth>
          }
        />
        <Route path="games/:id" element={<GameWithParams />} />
        <Route
          path="groups/:id"
          element={
            <RequireAuth>
              <GroupWithData />
            </RequireAuth>
          }
        />
        <Route
          path="entries/:id"
          element={
            <RequireAuth>
              <EntryWithData />
            </RequireAuth>
          }
        />
        <Route
          path="users/:id/entries"
          element={
            <RequireAuth>
              <UserEntriesWithData />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        >
          <Route path="search" element={<Search />} />
          <Route path="games/:id/master" element={<MasterEntryWithData />} />
        </Route>
        <Route path="login" element={<Auth />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
