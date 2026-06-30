"use server"

import { cookies } from "next/headers"
import { FullForm, personalSchema, subjectSchema } from "./data/schemas"
import prismaClient from "./prisma"

async function setCookie(name: string, value: string, path:string) {
    (await cookies()).set({
        name: name,
        value: value,
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        path: path
    })
}

async function getCookie(name: string) {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get(name)
    return cookieValue?.value || null
}

export async function storeStudentData1(form:FullForm){
    try {
        
    const subjectData = subjectSchema.parse(form)
    const personalData = personalSchema.parse(form)
    
    await setCookie("jupeb_form_data", personalData.email, "/")
    let ref_number:string = "";
   const response = await fetch(process.env.REGISTER+`name=${personalData.firstName}&email=${personalData.email}&phone=${personalData.phone}`, { method: "GET" ,})
    if (!response.ok) {
            throw new Error("Failed to register student");
        }
    const data = await response.json();
    if (data.success) {
        ref_number = String(data.data);
    } else {
        throw new Error("Failed to register student:", data.message);
    }
        
    

    

    await prismaClient.student.create({
        data: {
            first_name: personalData.firstName,
            last_name: personalData.lastName,
            middle_name: personalData.otherNames || "",
            city: personalData.city,
            state_province: personalData.stateProvince || "",
            postal: personalData.postalCode || "",
            street_address: personalData.street,
            ref_number: ref_number,
            country: personalData.country,
            state_of_origin: personalData.stateOfOrigin,
            lga: personalData.lga,
            dob: new Date(`${personalData.dobYear}-${personalData.dobMonth}-${personalData.dobDay}`),
            hobbies: personalData.hobbies,email: personalData.email,
            phone_number: personalData.phone,
            marital_status: personalData.maritalStatus,         faculty: subjectData.faculty,
            gender: personalData.gender,subjects: subjectData.programme,
        }
    });
    return { success: true, message: process.env.PAY+ref_number }
}
    catch (error) {
        
        return { success: false, message: error instanceof Error ? error.message : "An error occurred"   }
    }
}
export async function getStudentData(ref_number:string){
    try {
        const student = await prismaClient.student.findFirst({ 
            where: {
                ref_number: ref_number
            }
        })
        return { success: true, data: student } 

    }catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An error occurred"   }
    }
}