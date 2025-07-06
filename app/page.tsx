"use client"

import { useState, useEffect } from "react"

// Datos de prueba
const DEMO_USERS = [
  {
    id: "1",
    email: "admin@negocio.com",
    password: "admin123",
    name: "Administrador",
    role: "admin",
    phone: "+51999999999",
  },
  {
    id: "2",
    email: "empleado@negocio.com",
    password: "emp123",
    name: "Juan Empleado",
    role: "employee",
    phone: "+51987654321",
  },
]

export default function BusinessAdmin() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para datos
  const [products, setProducts] = useState([
    { id: "1", name: "Coca Cola 500ml", price: 3.5, stock: 100, category: "Bebidas" },
    { id: "2", name: "Pan Integral", price: 4.2, stock: 50, category: "Panadería" },
    { id: "3", name: "Leche Gloria 1L", price: 5.8, stock: 30, category: "Lácteos" },
    { id: "4", name: "Arroz Superior 1kg", price: 4.5, stock: 80, category: "Abarrotes" },
  ])

  const [sales, setSales] = useState([
    {
      id: "1",
      customer_name: "María García",
      product_name: "Coca Cola 500ml",
      product_id: "1",
      amount: 7.0,
      quantity: 2,
      employee_id: "2",
      employee_name: "Juan Empleado",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ])

  const [employees, setEmployees] = useState([
    {
      id: "1",
      name: "Juan Empleado",
      email: "empleado@negocio.com",
      phone: "+51987654321",
      position: "Vendedor",
      salary: 1200,
      hire_date: "2024-01-01",
      status: "active",
    },
  ])

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" })
  const [newSale, setNewSale] = useState({ customer_name: "", product_id: "", quantity: "1" })
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    salary: "",
  })

  const [activeTab, setActiveTab] = useState("dashboard")

  const login = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = DEMO_USERS.find((u) => u.email === loginForm.email && u.password === loginForm.password)

    if (!foundUser) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    setUser(foundUser)
    localStorage.setItem("business_user", JSON.stringify(foundUser))
    setSuccess("¡Bienvenido!")
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("business_user")
    setLoginForm({ email: "", password: "" })
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("business_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setError("Completa todos los campos del producto")
      return
    }

    const product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category || "Sin categoría",
    }

    setProducts([...products, product])
    setNewProduct({ name: "", price: "", stock: "", category: "" })
    setSuccess("Producto agregado correctamente")
  }

  const addSale = () => {
    if (!newSale.customer_name || !newSale.product_id) {
      setError("Completa todos los campos de la venta")
      return
    }

    const product = products.find((p) => p.id === newSale.product_id)
    if (!product) {
      setError("Producto no encontrado")
      return
    }

    const quantity = parseInt(newSale.quantity)
    if (product.stock < quantity) {
      setError("Stock insuficiente")
      return
    }

    const sale = {
      id: Date.now().toString(),
      customer_name: newSale.customer_name,
      product_name: product.name,
      product_id: product.id,
      amount: product.price * quantity,
      quantity: quantity,
      employee_id: user?.id || "",
      employee_name: user?.name || "",
      status: user?.role === "admin" ? "approved" : "pending",
      created_at: new Date().toISOString(),
    }

    setSales([sale, ...sales])

    if (user?.role === "admin") {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, stock: p.stock - quantity } : p)))
    }

    setNewSale({ customer_name: "", product_id: "", quantity: "1" })
    setSuccess("Venta registrada correctamente")
  }

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      setError("Completa todos los campos obligatorios")
      return
    }

    const employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      salary: parseFloat(newEmployee.salary) || 0,
      hire_date: new Date().toISOString().split("T")[0],
      status: "active",
    }

    setEmployees([...employees, employee])
    setNewEmployee({ name: "", email: "", password: "", phone: "", position: "", salary: "" })
    setSuccess("Empleado agregado correctamente")
  }

  const approveSale = (saleId, approve) => {
    setSales(
      sales.map((sale) => {
        if (sale.id === saleId) {
          if (approve && sale.product_id) {
            setProducts(products.map((p) => (p.id === sale.product_id ? { ...p, stock: p.stock - sale.quantity } : p)))
          }
          return { ...sale, status: approve ? "approved" : "rejected" }
        }
        return sale
      }),
    )
    setSuccess(`Venta ${approve ? "aprobada" : "rechazada"} correctamente`)
  }

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    setSuccess("Producto eliminado")
  }

  const totalSales = sales.filter((s) => s.status === "approved").reduce((sum, sale) => sum + sale.amount, 0)
  const pendingSales = sales.filter((s) => s.status === "pending").length

  // Pantalla de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border shadow-sm w-full max-w-md">
          <div className="p-6 pb-4 text-center">
            <h3 className="text-2xl font-semibold">Panel de Administración</h3>
            <p className="text-sm text-gray-600">Inicia sesión para continuar</p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@negocio.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="admin123"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                  <div className="text-sm">{error}</div>
                </div>
              )}
              {success && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                  <div className="text-sm">{success}</div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm space-y-2">
              <p className="font-medium">🔑 Credenciales de prueba:</p>
              <div className="space-y-1">
                <p><strong>Admin:</strong> admin@negocio.com / admin123</p>
                <p><strong>Empleado:</strong> empleado@negocio.com / emp123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista para empleados
  if (user.role === "employee") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Ventas</h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={logout}
              className="border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Salir
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
              <div className="text-sm">{error}</div>
            </div>
          )}
          {success && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-4">
              <div className="text-sm">{success}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold">Registrar Venta</h3>
                <p className="text-sm text-gray-600">Registra una nueva venta (requiere aprobación del admin)</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <input
                    value={newSale.customer_name}
                    onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                    placeholder="Nombre del cliente"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Producto</label>
                  <select
                    value={newSale.product_id}
                    onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="">Seleccionar producto</option>
                    {products
                      .filter((p) => p.stock > 0)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - S/ {product.price} (Stock: {product.stock})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  />
                </div>
                <button
                  onClick={addSale}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Registrar Venta
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold">Mis Ventas de Hoy</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {sales
                    .filter((sale) => {
                      const today = new Date().toDateString()
                      const saleDate = new Date(sale.created_at).toDateString()
                      return sale.employee_id === user.id && saleDate === today
                    })
                    .slice(0, 5)
                    .map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sale.customer_name}</p>
                          <p className="text-sm text-gray-600">{sale.product_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">S/ {sale.amount}</p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sale.status === "approved" ? "bg-blue-600 text-white" :
                            sale.status === "pending" ? "bg-gray-100 text-gray-900" : "bg-red-600 text-white"
                          }`}>
                            {sale.status === "approved" ? "Aprobada" : sale.status === "pending" ? "Pendiente" : "Rechazada"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista para administrador
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Bienvenido, {user.name}</p>
          </div>
          <button
            onClick={logout}
            className="border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Salir
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
            <div className="text-sm">{error}</div>
          </div>
        )}
        {success && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-4">
            <div className="text-sm">{success}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-6">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 grid grid-cols-2 lg:grid-cols-4 w-full">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "products", label: "Productos" },
              { id: "sales", label: "Ventas" },
              { id: "employees", label: "Empleados" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-gray-950 shadow-sm' : 'hover:bg-gray-200'
                } p-3`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                    <h3 className="text-sm font-medium">Ventas Aprobadas</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">S/ {totalSales.toFixed(2)}</div>
                    <p className="text-xs text-gray-600">Este mes</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                    <h3 className="text-sm font-medium">Productos</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{products.length}</div>
                    <p className="text-xs text-gray-600">En inventario</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                    <h3 className="text-sm font-medium">Ventas Pendientes</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{pendingSales}</div>
                    <p className="text-xs text-gray-600">Por revisar</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                    <h3 className="text-sm font-medium">Empleados</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{employees.filter((e) => e.status === "active").length}</div>
                    <p className="text-xs text-gray-600">Activos</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-4">
                    <h3 className="text-lg font-semibold">Ventas Pendientes de Aprobación</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      {sales
                        .filter((s) => s.status === "pending")
                        .slice(0, 5)
                        .map((sale) => (
                          <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{sale.customer_name}</p>
                              <p className="text-sm text-gray-600">{sale.product_name} x{sale.quantity}</p>
                              <p className="text-xs text-gray-600">Por: {sale.employee_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">S/ {sale.amount}</span>
                              <button
                                onClick={() => approveSale(sale.id, true)}
                                className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 text-sm rounded-md font-medium transition-colors"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => approveSale(sale.id, false)}
                                className="bg-red-600 text-white hover:bg-red-700 h-8 px-3 text-sm rounded-md font-medium transition-colors"
                              >
                                ✗
                              </button>
                            </div>
                          </div>
                        ))}
                      {sales.filter((s) => s.status === "pending").length === 0 && (
                        <p className="text-center text-gray-600 py-4">No hay ventas pendientes</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 pb-4">
                    <h3 className="text-lg font-semibold">Productos con Stock Bajo</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      {products
                        .filter((p) => p.stock <= 10)
                        .slice(0, 5)
                        .map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.stock <= 5 ? "bg-red-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-semibold">Agregar Producto</h3>
                  <p className="text-sm text-gray-600">Añade nuevos productos a tu inventario</p>
                </div>
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nombre del producto"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stock</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="Cantidad"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Categoría</label>
                      <input
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="Categoría"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addProduct}
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Agregar Producto
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-semibold">Lista de Productos</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm">Stock: {product.stock} unidades</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">S/ {product.price}</span>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3 text-sm rounded-md font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-semibold">Historial de Ventas</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{sale.customer_name}</h3>
                          <p className="text-sm text-gray-600">{sale.product_name} x{sale.quantity}</p>
                          <p className="text-xs text-gray-600">
                            Por: {sale.employee_name} - {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">S/ {sale.amount}</p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sale.status === "approved" ? "bg-blue-600 text-white" :
                            sale.status === "pending" ? "bg-gray-100 text-gray-900" : "bg-red-600 text-white"
                          }`}>
                            {sale.status === "approved" ? "Aprobada" : sale.status === "pending" ? "Pendiente" : "Rechazada"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-semibold">Agregar Empleado</h3>
                  <p className="text-sm text-gray-600">Registra nuevos empleados</p>
                </div>
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre Completo</label>
                      <input
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        placeholder="Nombre completo"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder="email@ejemplo.com"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Teléfono</label>
                      <input
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        placeholder="+51987654321"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cargo</label>
                      <input
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                        placeholder="Vendedor, Cajero, etc."
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Salario (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                        placeholder="1200.00"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addEmployee}
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Agregar Empleado
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-semibold">Lista de Empleados</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{employee.name}</h3>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              employee.status === "active" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}>
                              {employee.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{employee.position}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-gray-600">
                            <div>{employee.email}</div>
                            {employee.phone && <div>{employee.phone}</div>}
                            <span>Salario: S/ {employee.salary}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
