import { Router, Request, Response } from "express";
import { verificaToken } from "../auth/auth";

import { PedidosClass } from "../class/pedidosClass";

const pedidoRouter = Router();

pedidoRouter.post(
  "/crearPedido",
  [verificaToken],
  (req: Request, resp: Response) => {
    const crearPedido = new PedidosClass();
    crearPedido.crearPedido(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerPedidos",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerPedidos = new PedidosClass();
    obtenerPedidos.obtenerPedidos(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerPedido",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerPedido = new PedidosClass();
    obtenerPedido.obtenerPedido(req, resp);
  }
);

pedidoRouter.post(
  "/editarInfo",
  [verificaToken],
  (req: Request, resp: Response) => {
    const editarInfo = new PedidosClass();
    editarInfo.editarInfo(req, resp);
  }
);

export default pedidoRouter;
