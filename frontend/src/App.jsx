
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [token, setToken] = useState(
    localStorage.getItem("adminflowToken") || ""
  );
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("adminflowUser") || "null")
  );

  // Login and Registration
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // User Management
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const usersPerPage = 5;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  // Profile Management
  const [showProfile, setShowProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  // Messages
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  // API Helper
  const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!loginData.email.trim() || !loginData.password) {
      showMessage("Please enter email and password.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user.role !== "admin") {
        throw new Error(
          "Only administrators can access this dashboard."
        );
      }

      localStorage.setItem("adminflowToken", data.token);
      localStorage.setItem(
        "adminflowUser",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setCurrentUser(data.user);

      const usersResponse = await fetch(
        `${API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        }
      );

      const usersData = await usersResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || "Unable to load users"
        );
      }

      setUsers(usersData.users || []);
      setLoginData({ email: "", password: "" });
      setCurrentPage("dashboard");
      showMessage("Login successful!");

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessage();

    const { name, email, password, confirmPassword } = registerData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(
        "Password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      setCurrentPage("login");
      showMessage("Registration successful! Please login.");

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // LOAD USERS
  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/admin/users");
      setUsers(data.users || []);

    } catch (error) {
      showMessage(error.message, "error");

      if (
        error.message.toLowerCase().includes("unauthorized") ||
        error.message.toLowerCase().includes("token")
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // RESTORE LOGIN SESSION
  useEffect(() => {
    if (token && currentUser) {
      setCurrentPage("dashboard");
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ADD USER FORM
  const openAddForm = () => {
    setEditingUser(null);

    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "user"
    });

    setShowUserForm(true);
    clearMessage();
  };

  // EDIT USER FORM
  const openEditForm = (user) => {
    setEditingUser(user);

    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user"
    });

    setShowUserForm(true);
    clearMessage();
  };

  // SAVE USER
  const handleSaveUser = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!userForm.name.trim() || !userForm.email.trim()) {
      showMessage("Name and email are required.", "error");
      return;
    }

    if (!editingUser && !userForm.password) {
      showMessage(
        "Password is required for a new user.",
        "error"
      );
      return;
    }

    if (userForm.password && userForm.password.length < 6) {
      showMessage(
        "Password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (editingUser) {
        await apiRequest(
          `/admin/users/${editingUser._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload)
          }
        );

        showMessage("User updated successfully!");

      } else {
        await apiRequest("/admin/users", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        showMessage("User created successfully!");
      }

      setShowUserForm(false);
      setEditingUser(null);

      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "user"
      });

      await loadUsers();

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE USER
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await apiRequest(
        `/admin/users/${user._id}`,
        { method: "DELETE" }
      );

      showMessage("User deleted successfully!");
      await loadUsers();

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // OPEN PROFILE
  const handleOpenProfile = async () => {
    clearMessage();
    setShowProfile(true);

    setProfileData({
      name: currentUser?.name || "",
      email: currentUser?.email || ""
    });

    setPasswordData({
      currentPassword: "",
      newPassword: ""
    });

    try {
      setProfileLoading(true);

      const data = await apiRequest("/auth/profile");

      if (data.user) {
        const updatedUser = {
          ...currentUser,
          ...data.user,
          id: data.user._id || currentUser?.id
        };

        setProfileData({
          name: data.user.name || "",
          email: data.user.email || ""
        });

        setCurrentUser(updatedUser);

        localStorage.setItem(
          "adminflowUser",
          JSON.stringify(updatedUser)
        );
      }

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // UPDATE PROFILE
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim() || !profileData.email.trim()) {
      showMessage("Name and email are required.", "error");
      return;
    }

    try {
      setProfileLoading(true);

      const data = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim()
        })
      });

      const updatedUser = {
        ...currentUser,
        ...data.user,
        id: data.user._id || currentUser?.id
      };

      setCurrentUser(updatedUser);

      localStorage.setItem(
        "adminflowUser",
        JSON.stringify(updatedUser)
      );

      showMessage(
        data.message || "Profile updated successfully!"
      );

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword
    ) {
      showMessage("Please enter both passwords.", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage(
        "New password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    try {
      setProfileLoading(true);

      const data = await apiRequest(
        "/auth/change-password",
        {
          method: "PUT",
          body: JSON.stringify(passwordData)
        }
      );

      setPasswordData({
        currentPassword: "",
        newPassword: ""
      });

      showMessage(
        data.message || "Password changed successfully!"
      );

    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("adminflowToken");
    localStorage.removeItem("adminflowUser");

    setToken("");
    setCurrentUser(null);
    setUsers([]);
    setCurrentPage("login");
    setShowUserForm(false);
    setShowProfile(false);

    clearMessage();
  }

  // DASHBOARD STATISTICS
  const totalUsers = users.length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const regularUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  // SEARCH AND FILTER
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage)
  );

  const paginatedUsers = filteredUsers.slice(
    (currentUserPage - 1) * usersPerPage,
    currentUserPage * usersPerPage
  );

  // LOGIN PAGE
  if (currentPage === "login" && !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">

          <div className="brand">
            <div className="brand-logo">A</div>
            <h1>AdminFlow</h1>
            <p>USER MANAGEMENT SYSTEM</p>
          </div>

          <div className="heading">
            <h2>Welcome Back!</h2>
            <p>
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="name@example.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      password: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <p className={`message ${messageType}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="switch-page">
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  clearMessage();
                  setCurrentPage("register");
                }}
              >
                Create Account
              </button>
            </p>
          </div>

          <div className="auth-footer">
            <p>Secure access to your dashboard</p>
            <span>
              © 2026 AdminFlow. All rights reserved.
            </span>
          </div>

        </div>
      </div>
    );
  }

  // REGISTRATION PAGE
  if (currentPage === "register" && !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">

          <div className="brand">
            <div className="brand-logo">A</div>
            <h1>AdminFlow</h1>
            <p>USER MANAGEMENT SYSTEM</p>
          </div>

          <div className="heading">
            <h2>Create Account</h2>
            <p>
              Join AdminFlow and manage your account.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="name@example.com"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value
                  })
                }
              />
            </div>

            {message && (
              <p className={`message ${messageType}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="switch-page">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  clearMessage();
                  setCurrentPage("login");
                }}
              >
                Login
              </button>
            </p>
          </div>

          <div className="auth-footer">
            <p>Secure access to your dashboard</p>
            <span>
              © 2026 AdminFlow. All rights reserved.
            </span>
          </div>

        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-logo">A</div>
          <div>
            <h2>AdminFlow</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MENU
        </div>

        <button className="sidebar-link active">
          <span>▦</span> Dashboard
        </button>

        <button
          className="sidebar-link"
          onClick={() => {
            document
              .querySelector(".users-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>♙</span> User Management
        </button>

        <button
          className="sidebar-link"
          onClick={handleOpenProfile}
        >
          <span>◎</span> My Profile
        </button>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="sidebar-user-info">
              <strong>{currentUser?.name || "Admin"}</strong>
              <span>{currentUser?.role || "admin"}</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>
      </aside>

      {/* MAIN DASHBOARD */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back! Here's what's happening with AdminFlow.
            </p>
          </div>

          <div className="header-profile">
            <div className="header-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <strong>{currentUser?.name || "Admin"}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="add-user-btn"
            onClick={handleOpenProfile}
          >
            My Profile
          </button>
        </header>

        {message && (
          <div className={`dashboard-message ${messageType}`}>
            {message}
            <button onClick={clearMessage}>×</button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon purple">♙</div>
            <div>
              <p>Total Users</p>
              <h2>{totalUsers}</h2>
              <span>Registered accounts</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">♛</div>
            <div>
              <p>Administrators</p>
              <h2>{totalAdmins}</h2>
              <span>Admin accounts</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <p>Regular Users</p>
              <h2>{regularUsers}</h2>
              <span>User accounts</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⌁</div>
            <div>
              <p>System Status</p>
              <h2 className="status-online">Online</h2>
              <span>Connected to database</span>
            </div>
          </div>

        </section>

        {/* ANALYTICS */}
        <section className="analytics-grid">

          <div className="analytics-card">

            <div className="analytics-heading">
              <div>
                <h2>User Analytics</h2>
                <p>Account distribution overview</p>
              </div>
              <span className="analytics-icon">▥</span>
            </div>

            <div className="chart-content">

              <div className="donut-wrapper">
                <div
                  className="donut-chart"
                  style={{
                    background: `conic-gradient(
                      #6558e8 0% ${
                        totalUsers > 0
                          ? (totalAdmins / totalUsers) * 100
                          : 0
                      }%,
                      #36b37e ${
                        totalUsers > 0
                          ? (totalAdmins / totalUsers) * 100
                          : 0
                      }% 100%
                    )`
                  }}
                >
                  <div className="donut-center">
                    <strong>{totalUsers}</strong>
                    <span>Total Users</span>
                  </div>
                </div>
              </div>

              <div className="chart-legend">
                <div>
                  <span className="legend-dot admin-dot"></span>
                  <span>Administrators</span>
                  <strong>{totalAdmins}</strong>
                </div>

                <div>
                  <span className="legend-dot user-dot"></span>
                  <span>Regular Users</span>
                  <strong>{regularUsers}</strong>
                </div>
              </div>

            </div>
          </div>

          <div className="analytics-card">

            <div className="analytics-heading">
              <div>
                <h2>Role Statistics</h2>
                <p>Users grouped by account role</p>
              </div>
              <span className="analytics-icon">▤</span>
            </div>

            <div className="role-statistics">

              <div className="role-stat-row">
                <div>
                  <span>Administrators</span>
                  <strong>{totalAdmins}</strong>
                </div>
                <span>
                  {totalUsers
                    ? Math.round((totalAdmins / totalUsers) * 100)
                    : 0}%
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill admin-fill"
                  style={{
                    width: `${
                      totalUsers
                        ? (totalAdmins / totalUsers) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>

              <div className="role-stat-row">
                <div>
                  <span>Regular Users</span>
                  <strong>{regularUsers}</strong>
                </div>
                <span>
                  {totalUsers
                    ? Math.round((regularUsers / totalUsers) * 100)
                    : 0}%
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill user-fill"
                  style={{
                    width: `${
                      totalUsers
                        ? (regularUsers / totalUsers) * 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>

              <div className="analytics-total">
                Total registered accounts:{" "}
                <strong>{totalUsers}</strong>
              </div>

            </div>
          </div>

        </section>

        {/* USER MANAGEMENT */}
        <section className="users-section">

          <div className="section-header">
            <div>
              <h2>User Management</h2>
              <p>View and manage all registered accounts.</p>
            </div>

            <button
              className="add-user-btn"
              onClick={openAddForm}
            >
              + Add New User
            </button>
          </div>

          {/* ADD / EDIT USER FORM */}
          {showUserForm && (
            <div className="user-form-card">

              <div className="form-heading">
                <h3>
                  {editingUser ? "Edit User" : "Add New User"}
                </h3>

                <button
                  type="button"
                  className="close-form"
                  onClick={() => setShowUserForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveUser}>

                <div className="user-form-grid">

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          name: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          email: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Password{" "}
                      {editingUser &&
                        "(Leave blank to keep current)"}
                    </label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          password: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          role: e.target.value
                        })
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowUserForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingUser
                      ? "Update User"
                      : "Create User"}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* SEARCH AND FILTER */}
          <div className="user-toolbar">

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentUserPage(1);
                }}
              />
            </div>

            <select
              className="role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentUserPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
            </select>

          </div>

          {/* USERS TABLE */}
          <div className="table-wrapper">
            <table className="users-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Account ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <strong>{user.name}</strong>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`role-badge ${
                            user.role === "admin"
                              ? "admin-role"
                              : "user-role"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="user-id">
                        {user._id?.slice(-8)}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-btn"
                            onClick={() => openEditForm(user)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user)}
                            disabled={
                              user._id === currentUser?.id ||
                              user._id === currentUser?._id
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

          {/* PAGINATION */}
          <div className="table-footer">

            <span>
              Showing {paginatedUsers.length} of{" "}
              {filteredUsers.length} filtered user(s)
              {" "}({users.length} total)
            </span>

            <div className="pagination-controls">

              <button
                onClick={() =>
                  setCurrentUserPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={currentUserPage === 1}
              >
                ← Previous
              </button>

              <span>
                Page {currentUserPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentUserPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={currentUserPage >= totalPages}
              >
                Next →
              </button>

            </div>

            <button
              onClick={loadUsers}
              disabled={loading}
            >
              ↻ Refresh Users
            </button>

          </div>

        </section>

        {/* PROFILE MODAL */}
        {showProfile && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.55)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              overflowY: "auto"
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "620px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "16px",
                padding: "28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                color: "#1f2937"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px"
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>My Profile</h2>
                  <p style={{ color: "#64748b" }}>
                    View and update your account details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  style={{
                    border: 0,
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    fontSize: "22px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>

              {profileLoading && (
                <p style={{ color: "#64748b" }}>
                  Please wait...
                </p>
              )}

              {/* UPDATE PROFILE */}
              <form
                onSubmit={handleUpdateProfile}
                style={{
                  display: "grid",
                  gap: "14px",
                  marginBottom: "28px"
                }}
              >
                <h3>Personal Information</h3>

                <label style={{ display: "grid", gap: "6px" }}>
                  Full Name
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value
                      })
                    }
                    placeholder="Enter your name"
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  Email Address
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value
                      })
                    }
                    placeholder="Enter your email"
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px"
                    }}
                  />
                </label>

                <p>
                  Account Role:{" "}
                  <strong>{currentUser?.role || "admin"}</strong>
                </p>

                <button
                  type="submit"
                  disabled={profileLoading}
                  style={{
                    padding: "12px",
                    border: 0,
                    borderRadius: "8px",
                    background: "#6558e8",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {profileLoading
                    ? "Saving..."
                    : "Save Profile Changes"}
                </button>
              </form>

              {/* CHANGE PASSWORD */}
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "22px"
                }}
              >
                <h3>Change Password</h3>

                <form
                  onSubmit={handleChangePassword}
                  style={{ display: "grid", gap: "14px" }}
                >
                  <label style={{ display: "grid", gap: "6px" }}>
                    Current Password
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value
                        })
                      }
                      placeholder="Enter current password"
                      style={{
                        padding: "12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px"
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: "6px" }}>
                    New Password
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value
                        })
                      }
                      placeholder="Enter new password (minimum 6 characters)"
                      style={{
                        padding: "12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px"
                      }}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    style={{
                      padding: "12px",
                      border: 0,
                      borderRadius: "8px",
                      background: "#0f766e",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {profileLoading
                      ? "Updating..."
                      : "Change Password"}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="dashboard-footer">
          © 2026 AdminFlow. All rights reserved.
          <span>Secure User Management System</span>
        </footer>

      </main>
    </div>
  );
}

export default App;
