import { IsNotEmpty, MaxLength, IsString } from "class-validator";

export class LoginDTO {
   @IsString()
   @IsNotEmpty()
   @MaxLength(10)
   username: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(10)
   password: string;
}
