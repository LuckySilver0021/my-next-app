import * as z from 'zod';

export const signUpSchema=z.object({
    email:z.string().email("Invalid email address").min(1,"Email is required"),
    password:z.string().min(4,"Password must be at least 4 characters long"),
    passwordConfirm:z.string().min(1,"Password doesnt match"),
})



.refine((data)=>data.password===data.passwordConfirm,{
    message:"Passwords does not match",
    path:["passwordConfirm"],
});