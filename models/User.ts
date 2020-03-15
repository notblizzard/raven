import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity({ name: "users" })
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  discordId: string;

  @Column({ nullable: true })
  lastFmName: string;

  @Column({ default: 0 })
  points: number;

  static async findOrCreate(discordId: string): Promise<User> {
    const user = await User.findOne({ discordId });
    if (user) {
      return user;
    } else {
      const newUser = new User();
      newUser.discordId = discordId;
      await newUser.save();
      return newUser;
    }
  }
}
