"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormFIeld";
import SubmitButton from "../SubmitButton";
import { Dispatch, SetStateAction, useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { FormFieldType } from "./PatientForm";
import { Doctors } from "@/constants";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import { Appointment } from "@/types/appwrite.types";
import { scheduler } from "timers/promises";

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  // setOpen: (open: boolean) => void;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician : '',
      schedule: appointment ? new Date(appointment?.schedule): new Date(Date.now()),
      reason: appointment ? appointment.reason : '',
      note: appointment?.note || '',
      cancellationReason: appointment?.cancellationReason || '',
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
        break;
    }
    // console.log("aca", type);

    try {
      if (type === "create" && patientId) {
        // console.log("aqui if");
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status as Status,
        };

        const appointment = await createAppointment(appointmentData);

        // console.log(appointment);

        if (appointment) form.reset();
        router.push(
          `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
        );
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values?.primaryPhysician,
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log("error", error);
    }

    setIsLoading(false);
  }

  let buttonLabel;

  switch (type) {
    case "cancel":
      buttonLabel = "Cancelar cita";
      break;
    case "create":
      buttonLabel = "Crear cita";
      break;
    case "schedule":
      buttonLabel = "Programar cita";
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === 'create' && <section className="mb-12 space-y-4">
          <h1 className="header">Realiza Tu Cita</h1>
          <p className="text-dark-700">Pide tu cita rápidamente</p>
        </section>}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Médico"
              placeholder="Seleccione un médico"
            >
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      width={32}
                      height={32}
                      alt={doctor.name}
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Fecha prevista de la cita"
              showTimeSelect
              dateFormat="MM/dd/yyyy  -  h:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Motivo de la consulta"
                placeholder="Digite el motivo de la cita"
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Notas"
                placeholder="Ingrese las notas"
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Motivo de cancelación"
            placeholder="Escriba el motivo de la cancelación"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
