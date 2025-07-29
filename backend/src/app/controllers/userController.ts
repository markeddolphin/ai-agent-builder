import express from 'express';
import { db } from '../../lib/db/index.js';
import * as schema from '../../lib/db/schema.ts';
import { eq } from 'drizzle-orm';

type Request = express.Request;
type Response = express.Response;

export class UserController {
  // create a new user
  static async create(req: Request, res: Response) {
    try {
      const { id, email, name, emailConfirmed = false } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!emailConfirmed) {
        return res.status(202).json({ 
          message: 'User creation pending email confirmation',
          requiresEmailConfirmation: true
        });
      }

      const existingUserById = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (existingUserById.length > 0) {
        return res.status(200).json(existingUserById[0]);
      }

      const existingUserByEmail = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existingUserByEmail.length > 0) {
        return res.status(409).json({ 
          error: 'Email already registered with a different account',
          details: 'This email address is already associated with another user'
        });
      }

      const [user] = await db.insert(schema.users).values({
        id,
        email,
        name: name || email.split('@')[0],
        emailConfirmed: true, 
      }).returning();

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      res.status(500).json({ 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // create user after email confirmation
  static async createConfirmedUser(req: Request, res: Response) {
    try {
      const { id, email, name } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const existingUserById = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (existingUserById.length > 0) {
        return res.status(200).json(existingUserById[0]);
      }

      const existingUserByEmail = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existingUserByEmail.length > 0) {
        return res.status(409).json({ 
          error: 'Email already registered with a different account',
          details: 'This email address is already associated with another user'
        });
      }

      const [user] = await db.insert(schema.users).values({
        id,
        email,
        name: name || email.split('@')[0],
        emailConfirmed: true,
      }).returning();

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating confirmed user:', error);
      res.status(500).json({ 
        error: 'Failed to create confirmed user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // check email confirmation
  static async checkEmailConfirmation(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ 
          confirmed: false,
          error: 'User not found'
        });
      }

      const confirmed = user[0].emailConfirmed;
      
      res.status(200).json({ 
        confirmed,
        email: user[0].email,
        userId: user[0].id
      });
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      res.status(500).json({ 
        error: 'Failed to check email confirmation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // get user by id
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  // update user
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, name, emailConfirmed } = req.body;

      const [user] = await db
        .update(schema.users)
        .set({
          email,
          name,
          emailConfirmed,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, id))
        .returning();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
} 