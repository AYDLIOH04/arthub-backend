import {IsInt, IsString} from "class-validator";
import { Type } from "class-transformer";

export class ProgrammDto{

    title: any;

    link: any;

    description: any

    @Type(() => File)
    image: any
}