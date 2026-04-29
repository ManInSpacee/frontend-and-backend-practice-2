import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export const sequelize = new Sequelize("practice21", "postgres", "postgres", {
  host: "localhost",
  port: 5433,
  dialect: "postgres",
  logging: false,
});

// Модель пользователя
export const User = sequelize.define(
  "User",
  {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("user", "seller", "admin"),
      defaultValue: "user",
    },
    blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "users", underscored: true },
);

// Модель товара
export const Product = sequelize.define(
  "Product",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.STRING, defaultValue: "" },
  },
  { tableName: "products", underscored: true },
);

export async function initDB() {
  await sequelize.sync({ alter: true });

  const count = await User.count();
  if (count === 0) {
    await User.bulkCreate([
      {
        email: "admin@shop.com",
        first_name: "Алексей",
        last_name: "Смирнов",
        password: bcrypt.hashSync("admin1234", 10),
        role: "admin",
      },
      {
        email: "seller@shop.com",
        first_name: "Дмитрий",
        last_name: "Козлов",
        password: bcrypt.hashSync("seller1234", 10),
        role: "seller",
      },
      {
        email: "user@shop.com",
        first_name: "Иван",
        last_name: "Петров",
        password: bcrypt.hashSync("user1234", 10),
        role: "user",
      },
    ]);
    await Product.bulkCreate([
      { name: "Ноутбук", price: 75000, description: "Игровой ноутбук" },
      { name: "Мышь", price: 3500, description: "Беспроводная мышь" },
      {
        name: "Клавиатура",
        price: 5200,
        description: "Механическая клавиатура",
      },
    ]);
  }
}
