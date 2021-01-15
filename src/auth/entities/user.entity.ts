import * as bcrypt from 'bcrypt';
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryColumn, Unique } from "typeorm";
import { Role } from "./role.entity";
@Entity()
@Unique(['user_name'])
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id: string;
    @Column({ default: null })
    name: string;
    @Column()
    user_name: string;
    @Column()
    password: string;
    @Column({ default: null })
    phone: string;
    @Column({ default: null })
    email: string;

    // @ManyToMany(type => Role)
    // @JoinTable()


    @ManyToMany(type => Role)
    @JoinTable({
        name: "user_roles_role", // table name for the junction table of this relation
        joinColumn: {
            name: "user",
            referencedColumnName: "user_id"
        },
        inverseJoinColumn: {
            name: "role",
            referencedColumnName: "role"
        }
    })
    roles: Role[];

    @Column({ default: null })
    photo: string;

    @Column()
    salt: string;
    @Column({ default: (): string => 'LOCALTIMESTAMP' })
    create_date: Date;
    @Column({ default: (): string => 'LOCALTIMESTAMP' })
    update_date: Date;
    @Column({ default: true })
    status: boolean;

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}
