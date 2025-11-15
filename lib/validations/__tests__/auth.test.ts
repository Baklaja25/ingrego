import { describe, it, expect } from "@jest/globals"
import { registerSchema, loginSchema } from "../auth"

describe("Auth Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject short password", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "12345",
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject short name", () => {
      const invalidData = {
        name: "J",
        email: "john@example.com",
        password: "password123",
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "john@example.com",
        password: "password123",
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject empty password", () => {
      const invalidData = {
        email: "john@example.com",
        password: "",
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})



