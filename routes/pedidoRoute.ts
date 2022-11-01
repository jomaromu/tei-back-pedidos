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
  "/buscarPedidos",
  [verificaToken],
  (req: Request, resp: Response) => {
    const buscarPedidos = new PedidosClass();
    buscarPedidos.buscarPedidos(req, resp);
  }
);

pedidoRouter.get(
  "/buscarArchivados",
  [verificaToken],
  (req: Request, resp: Response) => {
    const buscarArchivados = new PedidosClass();
    buscarArchivados.buscarArchivados(req, resp);
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

pedidoRouter.delete(
  "/eliminarPedido",
  // [verificaToken],
  (req: Request, resp: Response) => {
    const eliminarPedido = new PedidosClass();
    eliminarPedido.eliminarPedido(req, resp);
  }
);

pedidoRouter.post(
  "/guardarHistorial",
  [verificaToken],
  (req: Request, resp: Response) => {
    const guardarHistorial = new PedidosClass();
    guardarHistorial.guardarHistorial(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerHistorial",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerHistorial = new PedidosClass();
    obtenerHistorial.obtenerHistorial(req, resp);
  }
);

export default pedidoRouter;
