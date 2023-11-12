import {IsEmail, IsInt, IsNotEmpty, IsString} from "class-validator";

export class UserDto {
    @IsNotEmpty()
    @IsInt()
    id: number;

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;
}