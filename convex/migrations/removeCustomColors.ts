import { internalMutation, query } from "../_generated/server";

export const checkUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({
      _id: u._id,
      clerkId: u.clerkId,
      hasCustomColors: "customColors" in u,
      customColors: (u as any).customColors
    }));
  },
});

export const removeCustomColors = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const results = [];
    
    for (const user of users) {
      const before = { ...(user as any) };
      const newUser: any = {
        clerkId: user.clerkId,
        email: user.email,
      };
      
      if (user.name) newUser.name = user.name;
      if (user.imageUrl) newUser.imageUrl = user.imageUrl;
      if (user.theme) newUser.theme = user.theme;
      
      await ctx.db.replace(user._id, newUser);
      
      results.push({
        _id: user._id,
        hadCustomColors: "customColors" in before,
        before: Object.keys(before),
        after: Object.keys(newUser)
      });
    }
    
    return { results };
  },
});
