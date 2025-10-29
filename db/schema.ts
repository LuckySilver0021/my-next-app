import {pgTable,text,uuid,integer,boolean} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const files=pgTable("files", {
  id:uuid("id").primaryKey().defaultRandom(),
  name:text("name").notNull(),
  path:text("path").notNull(),
  size:integer("size").notNull(),
  type:text("type").notNull(), // "folder"

  fileurl:text("fileurl").notNull(),//url to access the file
  thumbnailUrl:text("thumbnailUrl"),//url to access the thumbnail

  userId:text("user_id").notNull(),
  parentId:uuid("parent_id"), //parent folder id

  isFolder:boolean("is_folder").notNull().default(false),
  isStarred:boolean("is_starred").notNull().default(false),
  isTrash:boolean("is_trash").notNull().default(false),

  createdAt:timestamp("created_at").notNull().defaultNow(),
  updatedAt:timestamp("updated_at").notNull().defaultNow(),
})

// parent : ech file/folder can have one parent folder
// children: each folder can have many children files/folders

export const fileRelations=relations(files,({one,many})=>({
  parent:one(files,{
    fields:[files.parentId],
    references:[files.id]}),
    children:many(files),
}))

export const File=typeof files.$inferSelect;
export const NewFile=typeof files.$inferInsert;